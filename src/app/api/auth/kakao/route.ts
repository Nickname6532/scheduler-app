import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  const clientId = process.env.KAKAO_REST_API_KEY;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/kakao`;

  if (!clientId) {
    // In demo environment without API keys, return mock user
    return NextResponse.json({
      success: true,
      user: {
        user_id: `kakao-${Date.now()}`,
        kakao_id: 'kakao_demo_user',
        nickname: '카카오 사용자',
        profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      },
    });
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
      return NextResponse.json({ error: 'Token acquisition failed', details: tokenData }, { status: 400 });
    }

    // 2. Fetch Kakao User Profile
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userRes.json();

    return NextResponse.json({
      success: true,
      user: {
        user_id: `kakao-${userData.id}`,
        kakao_id: String(userData.id),
        nickname: userData.properties?.nickname || userData.kakao_account?.profile?.nickname || '카카오 회원',
        profile_image_url: userData.properties?.profile_image || userData.kakao_account?.profile?.profile_image_url,
        email: userData.kakao_account?.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
