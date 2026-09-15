import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const clientId = process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  if (!clientId) {
    return NextResponse.redirect(
      new URL('/?kakao_error=no_api_key', origin)
    );
  }

  const redirectUri = `${origin}/api/auth/kakao`;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
}
