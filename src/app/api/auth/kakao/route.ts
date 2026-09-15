import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(new URL('/?kakao_error=missing_code', origin));
  }

  const clientId =
    process.env.KAKAO_REST_API_KEY ||
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ||
    process.env.KAKAO_API_KEY ||
    process.env.KAKAO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const redirectUri = `${origin}/api/auth/kakao`;

  if (!clientId) {
    // If Kakao Key is not configured yet on Vercel
    return NextResponse.redirect(new URL('/?kakao_error=no_api_key', origin));
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        ...(process.env.KAKAO_CLIENT_SECRET ? { client_secret: process.env.KAKAO_CLIENT_SECRET } : {}),
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Kakao token error:', tokenData);
      return NextResponse.redirect(
        new URL(`/?kakao_error=${encodeURIComponent(tokenData.error_description || '토큰 발급 실패')}`, origin)
      );
    }

    // 2. Fetch Kakao User Profile
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userRes.json();
    const nickname = userData.properties?.nickname || userData.kakao_account?.profile?.nickname || '카카오 회원';
    const profile = userData.properties?.profile_image || userData.kakao_account?.profile?.profile_image_url || '';
    const email = userData.kakao_account?.email || '';

    // Redirect to home page with real Kakao user profile
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('kakao_auth', 'success');
    redirectUrl.searchParams.set('user_id', `kakao-${userData.id}`);
    redirectUrl.searchParams.set('kakao_id', String(userData.id));
    redirectUrl.searchParams.set('nickname', nickname);
    if (profile) redirectUrl.searchParams.set('profile', profile);
    if (email) redirectUrl.searchParams.set('email', email);

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error('Kakao OAuth error:', err);
    return NextResponse.redirect(
      new URL(`/?kakao_error=${encodeURIComponent(err.message || '인증 오류')}`, origin)
    );
  }
}
