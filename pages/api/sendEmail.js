import { NextResponse } from 'next/server';
const SibApiV3Sdk = require('sib-api-v3-sdk');

export async function POST(request) {
  // إعداد رؤوس CORS
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { email } = await request.json();
    console.log('طلب استلام البريد:', email);

    // التحقق من صحة البريد
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new NextResponse(
        JSON.stringify({ error: 'بريد إلكتروني غير صالح' }),
        { status: 400, headers }
      );
    }

    // تهيئة Brevo
    SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = 
      process.env.BREVO_API_KEY;

    // إرسال الإيميل
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const response = await apiInstance.sendTransacEmail({
      to: [{ email: process.env.ADMIN_EMAIL || 'your-email@example.com' }],
      sender: {
        email: 'noreply@yourdomain.com',
        name: 'نظام الدعوات'
      },
      subject: 'طلب جديد من العميل',
      htmlContent: `
        <div dir="rtl">
          <h2>طلب جديد</h2>
          <p>البريد: <strong>${email}</strong></p>
          <p>الوقت: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('تم الإرسال بنجاح:', response);
    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('تفاصيل الخطأ:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.body
    });
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'حدث خطأ في الخادم',
        details: error.message 
      }),
      { status: 500, headers }
    );
  }
}
