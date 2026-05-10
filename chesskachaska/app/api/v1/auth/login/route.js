import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REQUEST_TOKEN_COOKIE_NAME,
  issueAuthTokens,
  verifyPassword,
} from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/user";
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    displayName: user.displayName ?? "",
    avatarUrl: user.avatarUrl ?? "",
    country: user.country ?? "",
    rating: user.rating,
    stats: user.stats,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function createAuthResponse(user) {
  const {
    accessToken,
    accessTokenExpiresAt,
    requestToken,
    requestTokenExpiresAt,
  } = issueAuthTokens({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
  });

  const response = NextResponse.json(
    {

      message: "Login successful.",
      user: serializeUser(user),
      token: accessToken,
      accessToken,
      accessTokenExpiresAt,
      requestTokenExpiresAt,

    },
    { status: 200 }
  );

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(accessTokenExpiresAt * 1000),
  });

  response.cookies.set({
    name: REQUEST_TOKEN_COOKIE_NAME,
    value: requestToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(requestTokenExpiresAt * 1000),
  });

  return response;
}

export async function POST(request) {

  try {
    const body = await request.json();
    const identifier =
      typeof body.identifier === "string"
        ? body.identifier.trim()
        : typeof body.email === "string"
          ? body.email.trim()
          : typeof body.username === "string"
            ? body.username.trim()
            : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Username/email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = identifier.toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: new RegExp(`^${escapeRegex(identifier)}$`, "i") },
      ],
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    user.status = "online";
    user.lastSeenAt = new Date();
    await user.save();

    return createAuthResponse(user);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Unable to log in right now." },
      { status: 500 }
    );
  }
}
