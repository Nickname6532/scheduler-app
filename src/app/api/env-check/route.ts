import { NextResponse } from 'next/server';

export async function GET() {
  const kakaoRestKey =
    process.env.KAKAO_REST_API_KEY ||
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ||
    process.env.KAKAO_API_KEY ||
    process.env.KAKAO_CLIENT_ID;

  const kakaoJsKey =
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY ||
    process.env.KAKAO_JS_KEY;

  const kakaoSecret =
    process.env.KAKAO_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET;

  const resendKey = process.env.RESEND_API_KEY;

  const mask = (val?: string) =>
    val ? `${val.slice(0, 3)}***${val.slice(-3)} (${val.length}자)` : '❌ 미설정';

  // Find all env keys that might be Kakao/Resend related
  const relatedKeys = Object.keys(process.env).filter((k) =>
    k.toUpperCase().includes('KAKAO') ||
    k.toUpperCase().includes('RESEND') ||
    k.toUpperCase().includes('APP_URL')
  );

  return NextResponse.json({
    status: kakaoRestKey ? 'READY' : 'MISSING_KAKAO_KEY',
    summary: kakaoRestKey
      ? '카카오 로그인 키가 정상적으로 인식되고 있습니다.'
      : '카카오 REST API 키가 인식되지 않았습니다. Vercel 환경변수 등록 후 Redeploy가 필요합니다.',
    variables: {
      KAKAO_REST_API_KEY: mask(kakaoRestKey),
      NEXT_PUBLIC_KAKAO_JS_KEY: mask(kakaoJsKey),
      KAKAO_CLIENT_SECRET: mask(kakaoSecret),
      RESEND_API_KEY: mask(resendKey),
    },
    detected_related_env_names: relatedKeys,
    timestamp: new Date().toISOString(),
  });
}
