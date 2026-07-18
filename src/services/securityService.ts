import { tokenStore } from "@/lib/auth/token-store";

import api from "./api";
import type { AuthResponseDto } from "./authService";

export type PasskeyCredentialDto = {
  id: number;
  displayName: string;
  createdAt: string;
  lastUsedAt?: string;
  isBackedUp: boolean;
};

export type MfaStatusDto = {
  totpEnabled: boolean;
  hasPasskeys: boolean;
  passkeyCount: number;
  recoveryCodesRemaining: number;
  verifiedAt?: string;
  verifiedMethod?: string;
  passkeys: PasskeyCredentialDto[];
};

export type TotpEnrollmentDto = {
  flowId: string;
  secret: string;
  otpAuthUri: string;
  expiresAt: string;
};

type PasskeyOptionsDto = {
  flowId: string;
  options: Record<string, unknown>;
};

type PublicKeyCredentialWithJson = PublicKeyCredential & {
  toJSON?: () => unknown;
};

type PublicKeyCredentialConstructorWithJson = typeof PublicKeyCredential & {
  parseCreationOptionsFromJSON?: (
    options: Record<string, unknown>
  ) => PublicKeyCredentialCreationOptions;
  parseRequestOptionsFromJSON?: (
    options: Record<string, unknown>
  ) => PublicKeyCredentialRequestOptions;
};

function ensureWebAuthn() {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("PublicKeyCredential" in window) ||
    !navigator.credentials
  ) {
    throw new Error("Passkeys require a supported browser and a secure HTTPS connection.");
  }
}

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function encodeBase64Url(value: ArrayBuffer | null): string | null {
  if (value === null) return null;
  const bytes = new Uint8Array(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function creationOptionsFromJson(
  json: Record<string, unknown>
): PublicKeyCredentialCreationOptions {
  const constructor = PublicKeyCredential as PublicKeyCredentialConstructorWithJson;
  if (constructor.parseCreationOptionsFromJSON) {
    return constructor.parseCreationOptionsFromJSON(json);
  }
  const user = json.user as Record<string, unknown>;
  const excluded = (json.excludeCredentials ?? []) as Array<Record<string, unknown>>;
  return {
    ...(json as unknown as PublicKeyCredentialCreationOptions),
    challenge: decodeBase64Url(String(json.challenge)),
    user: {
      ...(user as unknown as PublicKeyCredentialUserEntity),
      id: decodeBase64Url(String(user.id)),
    },
    excludeCredentials: excluded.map((credential) => ({
      ...(credential as unknown as PublicKeyCredentialDescriptor),
      id: decodeBase64Url(String(credential.id)),
    })),
  };
}

function requestOptionsFromJson(json: Record<string, unknown>): PublicKeyCredentialRequestOptions {
  const constructor = PublicKeyCredential as PublicKeyCredentialConstructorWithJson;
  if (constructor.parseRequestOptionsFromJSON) {
    return constructor.parseRequestOptionsFromJSON(json);
  }
  const allowed = (json.allowCredentials ?? []) as Array<Record<string, unknown>>;
  return {
    ...(json as unknown as PublicKeyCredentialRequestOptions),
    challenge: decodeBase64Url(String(json.challenge)),
    allowCredentials: allowed.map((credential) => ({
      ...(credential as unknown as PublicKeyCredentialDescriptor),
      id: decodeBase64Url(String(credential.id)),
    })),
  };
}

function serializeCredential(credential: PublicKeyCredentialWithJson) {
  if (credential.toJSON) return credential.toJSON();

  if (credential.response instanceof AuthenticatorAttestationResponse) {
    return {
      id: credential.id,
      rawId: encodeBase64Url(credential.rawId),
      type: credential.type,
      extensions: credential.getClientExtensionResults(),
      response: {
        attestationObject: encodeBase64Url(credential.response.attestationObject),
        clientDataJSON: encodeBase64Url(credential.response.clientDataJSON),
        transports: credential.response.getTransports?.() ?? [],
      },
    };
  }

  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: encodeBase64Url(credential.rawId),
    type: credential.type,
    extensions: credential.getClientExtensionResults(),
    response: {
      authenticatorData: encodeBase64Url(response.authenticatorData),
      clientDataJSON: encodeBase64Url(response.clientDataJSON),
      signature: encodeBase64Url(response.signature),
      userHandle: encodeBase64Url(response.userHandle),
    },
  };
}

async function createCredential(options: Record<string, unknown>) {
  ensureWebAuthn();
  const credential = (await navigator.credentials.create({
    publicKey: creationOptionsFromJson(options),
  })) as PublicKeyCredentialWithJson | null;
  if (!credential) throw new Error("Passkey creation was cancelled.");
  return serializeCredential(credential);
}

async function getCredential(options: Record<string, unknown>) {
  ensureWebAuthn();
  const credential = (await navigator.credentials.get({
    publicKey: requestOptionsFromJson(options),
  })) as PublicKeyCredentialWithJson | null;
  if (!credential) throw new Error("Passkey verification was cancelled.");
  return serializeCredential(credential);
}

export const securityService = {
  isPasskeySupported: () =>
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "PublicKeyCredential" in window &&
    Boolean(navigator.credentials),

  status: async () => {
    const response = await api.get<MfaStatusDto>("/api/security/mfa");
    return response.data;
  },

  registerPasskey: async (displayName: string) => {
    const start = await api.post<PasskeyOptionsDto>("/api/security/passkeys/registration/options");
    const credential = await createCredential(start.data.options);
    const finish = await api.post<PasskeyCredentialDto>(
      "/api/security/passkeys/registration/finish",
      {
        flowId: start.data.flowId,
        displayName,
        response: credential,
      }
    );
    return finish.data;
  },

  loginWithPasskey: async (email?: string) => {
    const start = await api.post<PasskeyOptionsDto>(
      "/api/security/passkeys/login/options",
      { email: email?.trim() || undefined },
      { skipAuthRefresh: true }
    );
    const credential = await getCredential(start.data.options);
    const finish = await api.post<AuthResponseDto>(
      "/api/security/passkeys/login/finish",
      { flowId: start.data.flowId, response: credential },
      { skipAuthRefresh: true }
    );
    tokenStore.set(finish.data.token);
    return finish.data;
  },

  stepUpWithPasskey: async () => {
    const start = await api.post<PasskeyOptionsDto>("/api/security/passkeys/step-up/options");
    const credential = await getCredential(start.data.options);
    const finish = await api.post<{ verifiedAt: string; method: string }>(
      "/api/security/passkeys/step-up/finish",
      { flowId: start.data.flowId, response: credential }
    );
    return finish.data;
  },

  deletePasskey: async (credentialId: number) => {
    await api.delete(`/api/security/passkeys/${credentialId}`);
  },

  startTotpEnrollment: async () => {
    const response = await api.post<TotpEnrollmentDto>("/api/security/totp/enrollment");
    return response.data;
  },

  finishTotpEnrollment: async (flowId: string, code: string) => {
    const response = await api.post<{ recoveryCodes: string[] }>(
      "/api/security/totp/enrollment/finish",
      { flowId, code }
    );
    return response.data;
  },

  verifyTotp: async (code: string) => {
    const response = await api.post<{ verifiedAt: string; method: string }>(
      "/api/security/totp/verify",
      { code }
    );
    return response.data;
  },

  regenerateRecoveryCodes: async () => {
    const response = await api.post<{ recoveryCodes: string[] }>(
      "/api/security/totp/recovery-codes"
    );
    return response.data;
  },

  disableTotp: async () => {
    await api.delete("/api/security/totp");
  },
};
