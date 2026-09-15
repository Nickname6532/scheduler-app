import { NextResponse } from 'next/server';

// In-memory code store for verification demo (in production, use Redis or DB)
const codeStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code: userEnteredCode } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // VERIFY STEP: If user entered code to verify
    if (userEnteredCode) {
      const record = codeStore.get(email);
      if (!record) {
        return NextResponse.json(
          { error: '인증 코드가 요청되지 않았거나 만료되었습니다.' },
          { status: 400 }
        );
      }

      if (Date.now() > record.expiresAt) {
        codeStore.delete(email);
        return NextResponse.json(
          { error: '인증 코드가 만료되었습니다. 다시 시도해주세요.' },
          { status: 400 }
        );
      }

      if (record.code !== userEnteredCode.trim()) {
        return NextResponse.json(
          { error: '인증 코드가 일치하지 않습니다.' },
          { status: 400 }
        );
      }

      codeStore.delete(email);
      return NextResponse.json({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      });
    }

    // SEND STEP: Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    codeStore.set(email, { code: verificationCode, expiresAt });

    const apiKey = process.env.RESEND_API_KEY;
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const origin = request.headers.get('origin') || (host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const loginLink = `${origin}/?auth_email=${encodeURIComponent(email)}&auth_code=${verificationCode}`;

    if (apiKey) {
      // Real API Sending via Resend if API key is provided
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '모여봐 <onboarding@resend.dev>',
          to: [email],
          subject: '[모여봐] 로그인 링크 및 인증 코드',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #4f46e5; margin-bottom: 8px;">[모여봐] 로그인 안내</h2>
              <p style="color: #475569; font-size: 14px;">아래 버튼을 눌러 바로 로그인하거나 6자리 인증 코드를 입력하세요.</p>
              <div style="margin: 20px 0;">
                <a href="${loginLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none;">로그인 링크로 바로 시작하기</a>
              </div>
              <div style="font-size: 28px; font-weight: bold; color: #0f172a; letter-spacing: 4px; padding: 12px 0;">
                ${verificationCode}
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">본 링크와 인증 코드는 5분간 유효합니다.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Resend API Error:', errorData);
      }
    } else {
      console.log(`[Email Demo Mode] Sent to ${email}: Code=${verificationCode}, Link=${loginLink}`);
    }

    return NextResponse.json({
      success: true,
      message: '인증 코드 및 로그인 링크가 준비되었습니다.',
      // Return code & link in demo mode for instant testing
      demoCode: apiKey ? undefined : verificationCode,
      loginLink: apiKey ? undefined : loginLink,
      isDemo: !apiKey,
    });
  } catch (error: any) {
    console.error('Send code route error:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다: ' + error.message },
      { status: 500 }
    );
  }
}
