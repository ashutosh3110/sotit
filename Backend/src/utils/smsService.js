const axios = require('axios');

class SMSIndiaHubService {
  constructor() {
    this.apiKey = process.env.SMSINDIAHUB_API_KEY;
    this.senderId = process.env.SMSINDIAHUB_SENDER_ID || 'SMSHUB';
    this.entityId = process.env.SMSINDIAHUB_ENTITY_ID;
    this.templateId = process.env.SMSINDIAHUB_TEMPLATE_ID;
    this.baseUrl = 'https://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
  }

  normalizePhoneNumber(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('91') && digits.length === 12) return digits;
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.substring(1);
    return '91' + digits.slice(-10);
  }

  async sendOTP(phone, otp, type = 'register') {
    let message = '';
    let templateId = '';

    if (type === 'forget') {
      message = `Dear User, your OTP for password reset is ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone.-TLKTRD`;
      templateId = process.env.SMSINDIAHUB_FORGOT_TEMPLATE_ID;
    } else {
      message = `Dear User, your OTP for account registration is ${otp}. This OTP is valid for 10 minutes. Do not share it with anyone.TLKTRD`;
      templateId = process.env.SMSINDIAHUB_REGISTER_TEMPLATE_ID;
    }

    const isRealOtp = process.env.REAL_OTP === 'true';
    if (!isRealOtp) {
      console.log(`\n------------------------------------------------------------`);
      console.log(`[MOCK OTP] Skip sending SMS to ${phone}.`);
      console.log(`Template Type: ${type}`);
      console.log(`Template ID: ${templateId || 'None (Using Default)'}`);
      console.log(`Message: ${message}`);
      console.log(`------------------------------------------------------------\n`);
      return { success: true, message: 'Mock OTP generated successfully' };
    }

    return this.sendSMS(phone, message, templateId);
  }

  async sendSMS(phone, message, templateId) {
    try {
      // Load credentials dynamically at runtime to ensure dotenv has loaded
      const apiKey = this.apiKey || process.env.SMSINDIAHUB_API_KEY;
      const senderId = this.senderId || process.env.SMSINDIAHUB_SENDER_ID;
      const entityId = this.entityId || process.env.SMSINDIAHUB_ENTITY_ID;
      const finalTemplateId = templateId || this.templateId || process.env.SMSINDIAHUB_TEMPLATE_ID;

      if (!apiKey) {
        console.warn('⚠️ [SMSIndiaHub] Missing API Key. SMS NOT SENT.');
        return { success: false, error: 'Missing API Key' };
      }

      const normalizedPhone = this.normalizePhoneNumber(phone);

      const params = new URLSearchParams({
        APIKey: apiKey,
        msisdn: normalizedPhone,
        sid: senderId,
        msg: message,
        fl: '0',
        dc: '0',
        gwid: '2'
      });

      if (entityId) {
        params.append('EntityId', entityId);
      }
      if (finalTemplateId) {
        params.append('templateid', finalTemplateId);
      }

      const apiUrl = `${this.baseUrl}?${params.toString()}`;
      console.log(`📨 Sending SMS to ${normalizedPhone}...`);

      const response = await axios.get(apiUrl, {
        headers: { 'User-Agent': 'Sootit/1.0' },
        timeout: 10000
      });

      const responseData = typeof response.data === 'string' && response.data.trim().startsWith('{')
        ? JSON.parse(response.data)
        : response.data;

      if (typeof responseData === 'object' && responseData.ErrorCode === '000') {
        console.log('✅ SMS Sent Successfully');
        return { success: true, response: responseData };
      } else if (typeof responseData === 'object' && responseData.ErrorMessage) {
        console.error('❌ SMS Failed:', responseData);
        return { success: false, error: responseData.ErrorMessage };
      } else {
        console.log('ℹ️ SMS Response:', responseData);
        return { success: true, response: responseData };
      }

    } catch (error) {
      console.error('❌ SMS Service Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSIndiaHubService();
