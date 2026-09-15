import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const clientId =
    process.env.KAKAO_REST_API_KEY ||
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ||
    process.env.KAKAO_API_KEY ||
    process.env.KAKAO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  if (!clientId) {
    return NextResponse.redirect(
      new URL('/?kakao_error=no_api_key', origin)
    );
  }

  const redirectUri = `${origin}/api/auth/kakao`;
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
}
