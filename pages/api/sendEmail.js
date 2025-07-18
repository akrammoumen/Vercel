import { NextResponse } from 'next/server';
const SibApiV3Sdk = require('sib-api-v3-sdk');

export default async function handler(req, res) {
  // تعطيل مصادقة Vercel الافتراضية وإضافة CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    // التحقق من صحة البريد
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'بريد إلكتروني غير صالح' });
    }

    // إرسال الإيميل عبر Brevo (إذا كان المفتاح موجودًا)
    if (process.env.BREVO_API_KEY) {
      SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = 
        process.env.BREVO_API_KEY;

      await new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
        to: [{ email: process.env.ADMIN_EMAIL || 'your-email@example.com' }],
        sender: { email: 'noreply@yourdomain.com', name: 'نظام الدعوات' },
        subject: 'طلب جديد',
        htmlContent: `طلب من: ${email}`
      });
    }

    console.log('تم استلام البريد:', email);
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('خطأ في الإرسال:', error);
    return res.status(500).json({ 
      error: 'حدث خطأ في الخادم',
      details: error.message 
    });
  }
}
