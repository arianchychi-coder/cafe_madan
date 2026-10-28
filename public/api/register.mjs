/**
 * Cafe Madan registration Vercel Function, built on the supported Web Fetch API.
 * Server-only environment variables:
 *   RESEND_API_KEY, REGISTRATION_TO_EMAIL, REGISTRATION_FROM_EMAIL
 */
const responseHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const reply = (status, body, extraHeaders = {}) => Response.json(body, {
  status, headers: { ...responseHeaders, ...extraHeaders }
});
const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim();

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return reply(405, { success: false, message: 'فقط ارسال فرم پذیرفته می‌شود.' }, { Allow: 'POST' });
    }
    if ((request.headers.get('content-type') || '').split(';')[0].toLowerCase() !== 'application/json') {
      return reply(415, { success: false, message: 'نوع داده ارسالی معتبر نیست.' });
    }
    let body;
    try {
      const raw = await request.text();
      if (raw.length > 8192) return reply(413, { success: false, message: 'حجم اطلاعات ارسال‌شده بیش از حد مجاز است.' });
      body = JSON.parse(raw);
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new SyntaxError('invalid payload');
    } catch (_) {
      return reply(400, { success: false, message: 'ساختار اطلاعات ارسالی معتبر نیست.' });
    }

    const fullName = normalize(body.fullName);
    const phone = normalize(body.phone)
      .replace(/[\u06F0-\u06F9]/g, c => String(c.charCodeAt(0) - 0x06F0))
      .replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x0660));
    const role = normalize(body.role);
    const company = normalize(body.company);
    // Simple anti-bot honeypot, invisible to actual attendees.
    if (normalize(body.website)) return reply(200, { success: true });
    if (fullName.length < 3 || fullName.length > 90 || !/^\d{11}$/.test(phone) ||
        !['معدن‌دار یا بهره‌بردار', 'سرمایه‌گذار', 'مدیر شرکت معدنی', 'فعال حوزه تأمین مالی', 'کارشناس، مهندس یا مشاور', 'سایر'].includes(role) || company.length > 110) {
      return reply(422, { success: false, message: 'لطفاً نام، شماره ۱۱ رقمی و حوزه فعالیت را درست وارد کنید.' });
    }
    const { RESEND_API_KEY: apiKey, REGISTRATION_TO_EMAIL: to, REGISTRATION_FROM_EMAIL: from } = process.env;
    if (!apiKey || !to || !from) {
      return reply(503, { success: false, message: 'سامانه دریافت درخواست هنوز فعال نشده است. لطفاً با شماره‌های تماس سایت هماهنگ کنید.' });
    }

    const emailText = [
      'درخواست جدید حضور در همایش کافه معدن', '',
      'نام و نام خانوادگی: ' + fullName,
      'شماره تماس: ' + phone,
      'حوزه فعالیت: ' + role,
      'شرکت: ' + (company || 'اعلام نشده'),
      'زمان ارسال (UTC): ' + new Date().toISOString(), '',
      'این درخواست از فرم وب‌سایت کافه معدن ارسال شده است.'
    ].join('\n');
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from, to: to.split(',').map(address => address.trim()).filter(Boolean),
          subject: 'درخواست حضور همایش کافه معدن — ' + fullName,
          text: emailText
        }),
        signal: AbortSignal.timeout(8500)
      });
      if (!emailResponse.ok) {
        return reply(502, { success: false, message: 'ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید یا تماس بگیرید.' });
      }
      const receipt = await emailResponse.json().catch(() => ({}));
      if (!receipt.id) {
        return reply(502, { success: false, message: 'تأیید ارسال دریافت نشد. لطفاً با ما تماس بگیرید.' });
      }
      return reply(200, { success: true });
    } catch (_) {
      return reply(502, { success: false, message: 'اتصال به سامانه دریافت درخواست برقرار نشد. لطفاً بعداً تلاش کنید.' });
    }
  }
};
