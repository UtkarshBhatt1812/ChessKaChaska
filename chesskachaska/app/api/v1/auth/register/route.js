import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REQUEST_TOKEN_COOKIE_NAME,
  hashPassword,
  issueAuthTokens,
} from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/user";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

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

function createAuthResponse(user, status, message) {
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
      message,
      user: serializeUser(user),
      token: accessToken,
      accessToken,
      accessTokenExpiresAt,
      requestTokenExpiresAt,
    },
    { status }
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
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    if (!usernamePattern.test(username)) {
      return NextResponse.json(
        {
          message:
            "Username must be 3-20 characters and contain only letters, numbers, or underscores.",
        },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && confirmPassword !== password) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      $or: [
        { email },
        { username: new RegExp(`^${escapeRegex(username)}$`, "i") },
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with that username or email already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({
      username,
      email,
      passwordHash: hashPassword(password),
      displayName: username,
      status: "online",
      lastSeenAt: new Date(),
    });

    return createAuthResponse(user, 201, "Account created successfully.");
  } catch (error) {
    if (error && error.code === 11000) {
      return NextResponse.json(
        { message: "An account with that username or email already exists." },
        { status: 409 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Unable to register right now." },
      { status: 500 }
    );
  }
}
