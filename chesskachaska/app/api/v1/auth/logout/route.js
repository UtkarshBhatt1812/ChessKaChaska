import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REQUEST_TOKEN_COOKIE_NAME,
  verifyAccessToken,
  verifyRequestToken,
} from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/user";
async function updateUserSessionState(userId) {
  if (!userId) {
    return;
  }


  await User.findByIdAndUpdate(userId, {
    status: "offline",
    lastSeenAt: new Date(),
  });
}

function clearAuthCookies(response) {
  const cookieConfig = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  };

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: "",
    ...cookieConfig,
  });

  response.cookies.set({
    name: REQUEST_TOKEN_COOKIE_NAME,
    value: "",
    ...cookieConfig,
  });
}

export async function POST(request) {
  await connectDB();
  try {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    const requestToken = request.cookies.get(REQUEST_TOKEN_COOKIE_NAME)?.value;

    const accessPayload = accessToken ? verifyAccessToken(accessToken) : null;
    const requestPayload = requestToken ? verifyRequestToken(requestToken) : null;
    const userId = accessPayload?.sub || requestPayload?.sub;

    if (userId) {
      await updateUserSessionState(userId);
    }

    const response = NextResponse.json(
      { message: "Logout successful." },
      { status: 200 }
    );

    clearAuthCookies(response);
    return response;
  } catch (error) {
    console.error("Logout error:", error);

    const response = NextResponse.json(
      { message: "Logout successful." },
      { status: 200 }
    );

    clearAuthCookies(response);
    return response;
  }
}
