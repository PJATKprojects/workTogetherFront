export type LegalIdentity = Readonly<{
  isDraft: boolean;
  operatorName: string;
  operatorAddress: string;
  operatorRegister: string;
  operatorTaxId: string;
  contactEmail: string;
}>;

const missingValue = "—";

/**
 * Legal identity is server-only runtime configuration. The application never
 * invents an operator name or address. Setting the status to "published"
 * turns missing mandatory Polish provider details into a fail-fast error.
 */
export function getLegalIdentity(): LegalIdentity {
  const operatorName = clean(process.env.LEGAL_OPERATOR_NAME);
  const operatorAddress = clean(process.env.LEGAL_OPERATOR_ADDRESS);
  const operatorRegister = clean(process.env.LEGAL_OPERATOR_REGISTER);
  const operatorTaxId = clean(process.env.LEGAL_OPERATOR_NIP);
  const contactEmail = clean(process.env.LEGAL_CONTACT_EMAIL) ?? "support@worktogether.app";
  const isPublished = process.env.LEGAL_DOCUMENTS_STATUS?.trim().toLowerCase() === "published";

  const missing = [
    ["LEGAL_OPERATOR_NAME", operatorName],
    ["LEGAL_OPERATOR_ADDRESS", operatorAddress],
    ["LEGAL_OPERATOR_REGISTER", operatorRegister],
    ["LEGAL_OPERATOR_NIP", operatorTaxId],
    ["LEGAL_CONTACT_EMAIL", clean(process.env.LEGAL_CONTACT_EMAIL)],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (isPublished && missing.length > 0) {
    throw new Error(
      `Published legal documents require operator configuration: ${missing.join(", ")}`
    );
  }

  return {
    isDraft: !isPublished,
    operatorName: operatorName ?? missingValue,
    operatorAddress: operatorAddress ?? missingValue,
    operatorRegister: operatorRegister ?? missingValue,
    operatorTaxId: operatorTaxId ?? missingValue,
    contactEmail,
  };
}

function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
