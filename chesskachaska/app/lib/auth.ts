import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
const REQUEST_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
export const REQUEST_TOKEN_COOKIE_NAME = "request_token";

type TokenUser = {
  _id: string;
  username: string;
  email: string;
};

type TokenType = "access" | "request";

export type AuthTokenPayload = {
  sub: string;
  username: string;
  email: string;
  tokenType: TokenType;
  iat: number;
  exp: number;
};

function getTokenSecret(tokenType: TokenType) {
  const secret =
    (tokenType === "access"
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REQUEST_TOKEN_SECRET) ||
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "ACCESS_TOKEN_SECRET or REQUEST_TOKEN_SECRET must be set in environment variables"
    );
  }

  return secret;
}

function getTokenTtlSeconds(tokenType: TokenType) {
  const fallback =
    tokenType === "access"
      ? ACCESS_TOKEN_TTL_SECONDS
      : REQUEST_TOKEN_TTL_SECONDS;
  const rawValue =
    tokenType === "access"
      ? process.env.ACCESS_TOKEN_EXPIRES_IN
      : process.env.REQUEST_TOKEN_EXPIRES_IN;
  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedPasswordHash: string) {
  const [salt, storedHash] = storedPasswordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedKeyBuffer = Buffer.from(storedHash, "hex");

  if (storedKeyBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKeyBuffer, derivedKey);
}

function createJwtToken(user: TokenUser, tokenType: TokenType) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + getTokenTtlSeconds(tokenType);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload: AuthTokenPayload = {
    sub: user._id,
    username: user.username,
    email: user.email,
    tokenType,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getTokenSecret(tokenType))
    .update(signingInput)
    .digest("base64url");

  return {
    token: `${encodedHeader}.${encodedPayload}.${signature}`,
    expiresAt,
  };
}

export function createAccessToken(user: TokenUser) {
  return createJwtToken(user, "access");
}

export function createRequestToken(user: TokenUser) {
  return createJwtToken(user, "request");
}

export function issueAuthTokens(user: TokenUser) {
  const accessTokenData = createAccessToken(user);
  const requestTokenData = createRequestToken(user);

  return {
    accessToken: accessTokenData.token,
    accessTokenExpiresAt: accessTokenData.expiresAt,
    requestToken: requestTokenData.token,
    requestTokenExpiresAt: requestTokenData.expiresAt,
  };
}

function verifyJwtToken(
  token: string,
  expectedTokenType: TokenType
): AuthTokenPayload | null {
  try {
    const [encodedHeader, encodedPayload, receivedSignature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !receivedSignature) {
      return null;
    }

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac(
      "sha256",
      getTokenSecret(expectedTokenType)
    )
      .update(signingInput)
      .digest("base64url");
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    const receivedSignatureBuffer = Buffer.from(receivedSignature);

    if (receivedSignatureBuffer.length !== expectedSignatureBuffer.length) {
      return null;
    }

    if (!timingSafeEqual(receivedSignatureBuffer, expectedSignatureBuffer)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthTokenPayload;

    if (
      !payload.sub ||
      !payload.exp ||
      payload.tokenType !== expectedTokenType ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  return verifyJwtToken(token, "access");
}

export function verifyRequestToken(token: string): AuthTokenPayload | null {
  return verifyJwtToken(token, "request");
}
