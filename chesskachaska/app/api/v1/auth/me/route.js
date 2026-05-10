import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REQUEST_TOKEN_COOKIE_NAME,
  createAccessToken,
  verifyAccessToken,
  verifyRequestToken,
} from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/user";
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

export async function GET(request) {
  try {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    const requestToken = request.cookies.get(REQUEST_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken && !requestToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const accessPayload = accessToken ? verifyAccessToken(accessToken) : null;

    await connectDB();

    if (accessPayload?.sub) {
      const user = await User.findById(accessPayload.sub);

      if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
      }

      return NextResponse.json({ user: serializeUser(user) }, { status: 200 });
    }

    const requestPayload = requestToken ? verifyRequestToken(requestToken) : null;

    if (!requestPayload?.sub) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await User.findById(requestPayload.sub);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const refreshedAccessToken = createAccessToken({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json(
      { user: serializeUser(user) },
      { status: 200 }
    );

    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE_NAME,
      value: refreshedAccessToken.token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(refreshedAccessToken.expiresAt * 1000),
    });

    return response;
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
