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
          subject: '[모여봐] 이메일 인증 코드 안내',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #f59e0b;">[모여봐] 이메일 인증 코드</h2>
              <p>안녕하세요! 요청하신 인증 코드입니다.</p>
              <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px; padding: 15px 0;">
                ${verificationCode}
              </div>
              <p style="font-size: 12px; color: #64748b;">본 코드는 5분간 유효합니다.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Resend API Error:', errorData);
        // Fallback demo response if API fails
      }
    } else {
      console.log(`[Email Code Demo Mode] Sent to ${email}: Code is ${verificationCode}`);
    }

    return NextResponse.json({
      success: true,
      message: '인증 코드가 이메일로 전송되었습니다.',
      // In demo mode without ENV, return code for instant UI testing!
      demoCode: apiKey ? undefined : verificationCode,
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
