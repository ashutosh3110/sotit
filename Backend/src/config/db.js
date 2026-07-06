const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop the old non-sparse unique email index if it exists, so Mongoose can recreate it as sparse.
    try {
      const usersCol = mongoose.connection.collection('users');
      await usersCol.dropIndex('email_1');
      console.log('Successfully dropped old email_1 index.');
    } catch (indexErr) {
      // indexErr.code 27 means index does not exist, which is fine
      if (indexErr.code !== 27) {
        console.log(`Index cleanup note: ${indexErr.message}`);
      }
    }

    // Seed default vehicle types if they don't exist
    try {
      const VehicleType = require('../models/VehicleType');
      const defaults = ['Bike', 'Car', 'Truck', 'Bus', '2 Wheeler', '4 Wheeler'];
      for (const def of defaults) {
        const exists = await VehicleType.findOne({ name: def });
        if (!exists) {
          await VehicleType.create({ name: def });
        }
      }
      console.log('Default vehicle types verified/seeded successfully.');
    } catch (seedErr) {
      console.error('Error seeding default vehicle types:', seedErr.message);
    }

    // Seed default pages (Privacy Policy, Terms & Conditions) if they don't exist
    try {
      const Page = require('../models/Page');
      const defaultPages = [
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: `SOOTIT PRIVACY POLICY

Effective Date: July 6, 2026

Welcome to Sootit! Your privacy is of paramount importance to us. This Privacy Policy describes how Sootit ("we", "our", or "us") collects, uses, shares, and protects your information when you use our mobile application, website, and related on-demand vehicle services (collectively, the "Services").

By accessing or using our Services, you consent to the collection, transfer, storage, disclosure, and use of your information as described in this Privacy Policy.

1. INFORMATION WE COLLECT
We collect various types of information to provide and improve our Services:

A. Personal Information You Provide:
- Registration Details: When you register on Sootit as a customer, we collect your name, email address, phone number, and profile picture.
- Vehicle Information: To facilitate accurate repair and maintenance services, we collect vehicle details such as make, model, year of manufacture, and license plate/registration number.
- Payment Information: All payments are processed securely through external PCI-DSS compliant payment gateways (such as Razorpay). We do not store your raw credit/debit card numbers or CVV.

B. Information Collected Automatically:
- Location Data: With your explicit permission, we collect precise or approximate location coordinates from your device when the app is running in the foreground or background. This is crucial for matching you with nearby technicians, verifying service locations, and tracking active service requests.
- Device & Usage Information: We collect details about the device you use to access the app, including IP address, hardware model, operating system, and app performance logs.

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Connect you with registered service experts, mechanics, and drivers.
- Facilitate real-time tracking of technician arrival and service status.
- Process and verify payments for completed bookings.
- Send transactional alerts, booking confirmations, and support communications via email, SMS, or WhatsApp.
- Provide customer support and resolve disputes or issues.
- Improve our application, services, and system performance.
- Ensure safety, prevent fraud, and comply with legal obligations.

3. HOW WE SHARE YOUR INFORMATION
We respect your privacy and only share your data under the following circumstances:
- With Service Vendors: To fulfill your booking, we share your name, phone number, vehicle details, and service location with the matched technician/vendor.
- With Payment Gateways: We share necessary transaction details with our secure payment partners (e.g., Razorpay) to process payments.
- For Legal Reasons: We may disclose your information if required to do so by law, regulation, or legal process, or to protect the safety and rights of Sootit, its users, or the public.

4. DATA SECURITY AND RETENTION
We implement robust administrative, technical, and physical security measures to safeguard your personal data from unauthorized access, loss, or alteration. We retain your personal information for as long as your account is active or as needed to provide you Services and satisfy legal compliance.

5. YOUR RIGHTS AND CHOICES
- Account Access & Update: You can review and update your profile information anytime through the account settings in the Sootit application.
- Location Permissions: You can enable or disable location services at any time through your device settings. Note that disabling location tracking may limit the core functionality of our on-demand services.
- Data Deletion: You can request the deletion of your account and personal data by reaching out to our support team at sootit3@gmail.com.

6. CONTACT US
If you have any questions, concerns, or feedback regarding this Privacy Policy or our data practices, please contact us:
- Email Support: sootit3@gmail.com
- Phone Support: 9437153203`,
          target: 'customer'
        },
        {
          title: 'Terms & Conditions',
          slug: 'terms-and-conditions',
          content: `SOOTIT TERMS AND CONDITIONS

Effective Date: July 6, 2026

Welcome to Sootit! These Terms and Conditions ("Terms") govern your use of the Sootit mobile application, website, and related on-demand vehicle services (collectively, the "Services"). By registering, accessing, or using our Services, you agree to be bound by these Terms.

1. SERVICES DESCRIPTION
Sootit is an on-demand platform that connects vehicle owners ("Customers") with third-party service providers, mechanics, drivers, and towing operators ("Partners/Vendors"). Sootit does not directly provide vehicle repair, driving, or towing services. We act as an intermediary to facilitate bookings, communication, and payments.

2. ELIGIBILITY AND ACCOUNT
- You must be at least 18 years old to create an account and use the Services.
- You agree to provide accurate, complete, and updated information during registration.
- You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

3. BOOKINGS AND CANCELLATIONS
- Placing a booking constitutes an offer to obtain services from a Partner.
- Estimated arrival times and service costs are approximations. Actual times and prices may vary depending on road conditions, actual vehicle issues, and other external factors.
- Cancellation policies and fees may apply if you cancel a booking after a Partner has been dispatched.

4. PAYMENTS AND BILLING
- You agree to pay all fees associated with the services you book.
- Payments are processed securely via our integrated payment gateway (Razorpay).
- Prices are subject to change, but changes will not affect bookings that have already been confirmed.

5. USER CONDUCT
You agree NOT to:
- Use the Services for any unlawful purpose.
- Impersonate any person or entity, or falsely state your affiliation.
- Harass, abuse, or harm Partners or other users.
- Modify, adapt, or hack the Services or attempt to gain unauthorized access to our servers.

6. LIMITATION OF LIABILITY
To the maximum extent permitted by law, Sootit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
- Your use of or inability to use the Services.
- The behavior, quality, safety, or legality of services provided by third-party Partners.
- Any unauthorized access to or use of our servers and/or personal information stored therein.

7. AMENDMENTS TO TERMS
 We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our application or via email. Your continued use of the Services after such changes constitutes acceptance of the new Terms.

8. CONTACT US
If you have any questions about these Terms, please contact us at sootit3@gmail.com.`,
          target: 'customer'
        },
        {
          title: 'Partner Privacy Policy',
          slug: 'partner-privacy-policy',
          content: `SOOTIT PARTNER PRIVACY POLICY

Effective Date: July 6, 2026

Welcome to Sootit! This Partner Privacy Policy describes how Sootit ("we", "our", or "us") collects, uses, stores, and shares the personal information of our registered service experts, technicians, mechanics, drivers, and towing operators (collectively, "Partners" or "Vendors").

1. INFORMATION WE COLLECT
To register and operate as a Partner on Sootit, we collect:
- Profile Details: Name, email address, phone number, profile photo, and business address.
- Verification & KYC Documents: Government-issued identification, driver's license, vehicle registration, trade licenses, bank account details (for payouts), and background check documents.
- Real-Time Location: We collect your precise location coordinates when the app is active (and, with your permission, when it is in the background) to match you with nearby customer requests, track job progress, and calculate arrival times.
- Rating and Feedback: Feedback and ratings provided by customers after a service is completed.

2. HOW WE USE YOUR INFORMATION
We use your information to:
- Verify your credentials and suitability to provide services.
- Route booking requests from customers in your vicinity.
- Facilitate navigation to the customer's location.
- Process payouts and manage your partner wallet.
- Monitor and ensure service quality, safety, and compliance with our standards.
- Provide partner support and handle disputes.

3. INFORMATION SHARING
- With Customers: To facilitate the booking, we share your name, profile photo, contact number, vehicle details, current ratings, and real-time location with the customer who booked your service.
- Verification Agencies: We may share your documents with third-party verification agencies to complete background checks.
- Legal Authorities: We may disclose your information if required to comply with law enforcement, regulatory bodies, or legal processes.

4. DATA SECURITY
We employ strict administrative and technical security measures to protect your KYC documents, bank details, and personal data from unauthorized access, theft, or misuse.

5. CONTACT US
For questions regarding your partner account privacy, contact us at sootit3@gmail.com.`,
          target: 'vendor'
        },
        {
          title: 'Partner Terms & Conditions',
          slug: 'partner-terms-and-conditions',
          content: `SOOTIT PARTNER TERMS AND CONDITIONS

Effective Date: July 6, 2026

These Partner Terms and Conditions ("Partner Terms") govern the relationship between Sootit ("we", "our", or "us") and independent service experts, technicians, mechanics, drivers, and towing operators (collectively, "Partners" or "Vendors") who register on the Sootit platform to provide services.

1. REGISTRATION AND CREDENTIALS
- Partners must complete registration and submit all required KYC, qualification, and vehicle documents.
- You represent that all information, certifications, and licenses provided are valid, accurate, and current.
- Sootit reserves the right to accept or reject any Partner registration or suspend accounts without prior notice.

2. SERVICE STANDARDS
- You agree to provide services in a professional, safe, and timely manner.
- You must maintain your vehicle and tools in excellent working condition.
- You agree to treat customers with respect and maintain a high standard of conduct. Low ratings or customer complaints may result in account review or deactivation.

3. PRICING AND PAYOUTS
- Service rates are determined by the Sootit platform or negotiated through the app's standard flow.
- Sootit will deduct its platform commission fee from the total service fee charged to the customer.
- Payouts will be processed to your registered bank account or wallet as per the platform's payment cycle, subject to completion of services.

4. INDEPENDENT CONTRACTOR STATUS
Partners are independent contractors and not employees, agents, or joint venturers of Sootit. You are solely responsible for your own taxes, insurance, equipment, vehicle maintenance, and compliance with local laws.

5. LIMITATION OF LIABILITY AND INDEMNITY
- Sootit is not liable for any disputes, damage, injury, or loss arising between you and the customer.
- You agree to indemnify and hold Sootit harmless from any claims, losses, damages, or expenses resulting from your performance of services or violation of these Terms.

6. TERMINATION
Either party may terminate this agreement at any time. Sootit may immediately terminate or suspend your access if you breach these terms, fail to maintain ratings, or engage in fraudulent activity.

7. CONTACT US
For any issues or support regarding partner operations, please reach out to sootit3@gmail.com.`,
          target: 'vendor'
        }
      ];

      for (const pageInfo of defaultPages) {
        const exists = await Page.findOne({ slug: pageInfo.slug });
        if (!exists) {
          await Page.create(pageInfo);
        } else if (exists.content.startsWith('This is the default')) {
          exists.content = pageInfo.content;
          await exists.save();
          console.log(`Updated placeholder content for page: ${pageInfo.slug}`);
        }
      }
      console.log('Default system pages verified/seeded successfully.');
    } catch (pageSeedErr) {
      console.error('Error seeding default system pages:', pageSeedErr.message);
    }

    // Seed/verify default system settings
    try {
      const SystemSetting = require('../models/SystemSetting');
      let settings = await SystemSetting.findOne();
      if (!settings) {
        await SystemSetting.create({});
        console.log('Default system settings seeded.');
      } else if (settings.supportEmail === 'support@sootit.com') {
        settings.supportEmail = 'sootit3@gmail.com';
        await settings.save();
        console.log('System settings updated to sootit3@gmail.com.');
      }
    } catch (settingsErr) {
      console.error('Error seeding default system settings:', settingsErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
