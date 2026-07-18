const baseUrl = required("SYNTHETIC_BASE_URL").replace(/\/$/, "");
const locale = process.env.SYNTHETIC_LOCALE || "en";
const email = required("SYNTHETIC_EMAIL");
const password = required("SYNTHETIC_PASSWORD");
const checks = [];

async function check(name, operation) {
  const started = performance.now();
  try {
    await operation();
    checks.push({ name, ok: true, durationMs: Math.round(performance.now() - started) });
  } catch (error) {
    checks.push({
      name,
      ok: false,
      durationMs: Math.round(performance.now() - started),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function json(path, init = {}) {
  const response = await request(path, init);
  if (!response.ok) {
    throw new Error(`${init.method || "GET"} ${path}: ${response.status}`);
  }
  return response.json();
}

async function request(path, init = {}) {
  return fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...init,
    headers: {
      "content-type": "application/json",
      "x-correlation-id": `synthetic-${crypto.randomUUID()}`,
      ...(init.headers || {}),
    },
  });
}

await check("health", async () => {
  const response = await fetch(`${baseUrl}/health/ready`);
  if (!response.ok) throw new Error(`health: ${response.status}`);
});

await check("registration-route", async () => {
  const response = await fetch(`${baseUrl}/${locale}/auth/register`);
  if (!response.ok) throw new Error(`register page: ${response.status}`);
});

await check("registration-command", async () => {
  const response = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      userName: `SyntheticProbe${Date.now()}`,
      email,
      password,
      confirmPassword: password,
      dateOfBirth: "1990-01-01",
      locale,
      acceptCommunityGuidelines: true,
    }),
  });
  if (response.status !== 409) {
    throw new Error(`duplicate-safe registration probe: expected 409, received ${response.status}`);
  }
});

let accessToken = "";
await check("login", async () => {
  const session = await json("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  accessToken = session.token;
  if (!accessToken) throw new Error("login returned no access token");
});

await check("search", async () => {
  const result = await json("/api/projects?page=1&pageSize=3&sort=-createdAt", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!Array.isArray(result.items)) throw new Error("search returned no items");
});

await check("application-list", async () => {
  const result = await json("/api/applications/me?page=1&pageSize=1", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!Array.isArray(result.items)) throw new Error("application route returned no items");
});

await check("application-command", async () => {
  const response = await request("/api/applications", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      projectPositionId: 2147483647,
      isDraft: true,
      attachmentUrl: "",
      message: "",
      whyProject: "",
      firstWeekPlan: "",
      availability: "",
    }),
  });
  if (response.status !== 404) {
    throw new Error(
      `side-effect-free application probe: expected 404, received ${response.status}`
    );
  }
});

await check("email-outbox-ingress", async () => {
  await json("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
});

await check("security-headers", async () => {
  const response = await fetch(`${baseUrl}/${locale}`);
  for (const header of ["content-security-policy", "x-content-type-options", "referrer-policy"]) {
    if (!response.headers.has(header)) throw new Error(`missing ${header}`);
  }
});

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), checks }, null, 2));
if (checks.some((item) => !item.ok)) process.exitCode = 1;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
