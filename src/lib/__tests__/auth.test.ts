import { test, expect, vi, beforeEach } from "vitest";

// Mock server-only so it doesn't throw in the test environment
vi.mock("server-only", () => ({}));

// Mock next/headers — we control the cookie value per test
const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGet })),
}));

// Mock jose so tests don't depend on crypto environment quirks
const mockJwtVerify = vi.fn();
vi.mock("jose", () => ({
  SignJWT: vi.fn(),
  jwtVerify: mockJwtVerify,
}));

const { getSession } = await import("@/lib/auth");

const validPayload = {
  userId: "user-123",
  email: "test@example.com",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

beforeEach(() => {
  mockGet.mockReset();
  mockJwtVerify.mockReset();
});

test("getSession returns null when no auth cookie is present", async () => {
  mockGet.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
  expect(mockJwtVerify).not.toHaveBeenCalled();
});

test("getSession returns the session payload for a valid token", async () => {
  mockGet.mockReturnValue({ value: "valid.jwt.token" });
  mockJwtVerify.mockResolvedValue({ payload: validPayload });

  const session = await getSession();

  expect(session).not.toBeNull();
  expect(session?.userId).toBe("user-123");
  expect(session?.email).toBe("test@example.com");
});

test("getSession passes the cookie token to jwtVerify", async () => {
  mockGet.mockReturnValue({ value: "some.token.value" });
  mockJwtVerify.mockResolvedValue({ payload: validPayload });

  await getSession();

  expect(mockJwtVerify).toHaveBeenCalledWith("some.token.value", expect.anything());
});

test("getSession returns null when jwtVerify throws (expired token)", async () => {
  mockGet.mockReturnValue({ value: "expired.jwt.token" });
  mockJwtVerify.mockRejectedValue(new Error("JWTExpired: token expired"));

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null when jwtVerify throws (wrong secret)", async () => {
  mockGet.mockReturnValue({ value: "tampered.jwt.token" });
  mockJwtVerify.mockRejectedValue(new Error("JWSSignatureVerificationFailed"));

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null when jwtVerify throws (malformed token)", async () => {
  mockGet.mockReturnValue({ value: "not.a.valid.jwt" });
  mockJwtVerify.mockRejectedValue(new Error("JWTMalformed"));

  const session = await getSession();

  expect(session).toBeNull();
});
