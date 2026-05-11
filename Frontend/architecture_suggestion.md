    # DriverFinder - System Architecture & Production Flow

    This document details the production-level system architecture, module breakdown, and data flow for the DriverFinder platform.

    ## 1. System Modules Overview

    ### A. User Module (Client App/Web)
    Designed for clients seeking services for their vehicles or specific use-cases.

    *   **Registration/Profile:**
        *   **Personal Info:** Name, Mobile (OTP Verified), Email, Profile Picture, Location/Address.
        *   **Vehicle Details (Multiple allowed):** Vehicle Type (2W, 4W, Heavy), Registration Number (RC), Make & Model, Year of Manufacture, Insurance Expiry.
    *   **Core Pages/Screens:**
        *   **Dashboard:** Quick actions (Hire Driver, Emergency Towing, Find Mechanic, etc.), active request status.
        *   **Post a Job/Service Request:** Form to post a requirement (e.g., "Need a driver for outstation trip", "Car breakdown at Highway").
        *   **Vendor Directory:** Browse and filter vendors by category, rating, distance.
        *   **My Bookings/Requests:** Active, Past, and Cancelled requests.
        *   **Wallet / Payment:** Add money to wallet, transaction history.

    ### B. Vendor Module (Partner App/Web)
    Designed for service providers. The specific onboarding fields change dynamically based on the role selected.

    *   **Vendor Roles & Dynamic Fields:**
        1.  **Driver:** Driving License Number, DL Expiry, Vehicle classes authorized to drive, Years of Experience, Background Check Consent.
        2.  **Mechanic:** Specialties (Engine, Electrical, Body), Service Type (Garage only, On-site, Both), Garage Address/Location.
        3.  **RTO Active Agent:** RTO Office Location (e.g., MH-12), Services Provided (RC Transfer, License Renewal, etc.), Agent Registration Nuumber (if applicable).
        4.  **Legal Advisor:** Bar Council Registration Number, Practice Area (Traffic Violations, Accidental Claims), Visiting Address.
        5.  **Towing Service Provider:** Number of flatbeds/trucks, Max towing capacity, Base Location, Coverage Radius (e.g., 50km).
    *   **Core Pages/Screens:**
        *   **Dashboard:** New leads, Active jobs, Earnings summary, Online/Offline toggle.
        *   **Job Board (Leads):** View jobs posted by users matching their category.
        *   **My Services:** Update availability, manage profile.
        *   **Wallet:** Balance, Withdrawal requests.

    ### C. Admin Module (Web Portal)
    To govern and manage the entire ecosystem.

    *   **Core Pages:**
        *   **Master Dashboard:** Total users, Total vendors (by category), Total transactions, Revenue generated.
        *   **User Management:** View, Block, or Delete users.
        *   **Vendor Verification (KYC):** Approve or reject pending vendor profiles (Verify DL, Bar Council No, etc.).
        *   **Dispute/Support Management:** Handle issues reported by users or vendors.
        *   **Financials & Ledger:** Manage wallet balances, withdrawal requests, set commission rates, revenue tracking.

    ---

    ## 2. Core Workflows

    To facilitate connection and satisfy the "Rs. 5 Token Fee" requirement seamlessly.

    ### Flow 1: User directly Hiring a Vendor
    1.  **Action:** User opens Vendor Directory and finds a specific "Legal Advisor".
    2.  **Token Payment:** User clicks "Hire Now". System prompts to deduct Rs. 5 from the User's Internal Wallet.
    3.  **Request Sent:** Once Rs. 5 is deducted, the request goes to the Specific Vendor as a push notification.
    4.  **Vendor Action:** Vendor reviews the request and clicks "Accept" or "Reject".
        *   *If Accepted:* Contact details are exchanged.
        *   *If Rejected/Timeout:* Rs. 5 is refunded to the User's Wallet automatically.

    ### Flow 2: User Posts a Job -> Vendors Apply
    1.  **Action:** User posts a requirement (e.g., "Need Mechanic for Swift Dzire starting issue at Location X").
    2.  **Broadcast:** System broadcasts this job to nearby Mechanics.
    3.  **Vendor Action:** Mechanics see the job on their Job Board. To apply, a Mechanic clicks "Apply for Job".
    4.  **Token Payment:** System deducts Rs. 5 from the Vendor's Internal Wallet.
    5.  **Matching:** User receives multiple applications from Mechanics. User chooses one.
        *   *Note:* The Rs. 5 fee for vendors acts as a spam filter so they only apply to jobs they actually want to do.

    ---

    ## 3. Production Strategy for "Rs. 5 Token Fee" (Critical)

    **The Problem:** Direct payment gateways (Razorpay, Stripe, PayU) charge a flat fee (e.g., Rs. 2 - 3) + percentage per transaction. A direct card/UPI transaction of Rs. 5 will result in the gateway taking the majority of the money, or failing due to minimum transaction limits.

    **The Production Solution: Closed-loop Wallet System**
    *   **Implement an Internal Wallet:** Both Users and Vendors will have a virtual wallet within the app.
    *   **Recharging Wallet:** They must recharge their wallet in bulk (Minimum Recharge Rs. 50 or Rs. 100 via Payment Gateway).
    *   **Token Deductions:** The Rs. 5 application/hiring fee is simply a database deduction from their wallet balance. This costs 0 transaction fees and happens instantly.
    *   **Ledger:** Maintain a strict ledger table in your database for every virtual Rs. 5 deduction.

    ---

    ## 4. Tech Stack Recommendations

    *   **Frontend UI:** React (Web), React Native (Mobile).
    *   **Backend:** Node.js with Express / NestJS. Highly scalable for concurrent requests and real-time socket connections.
    *   **Database:** PostgreSQL (Ideal for Wallet ACID transactions and relational data).
    *   **Real-time Communication:** Socket.io / Firebase Cloud Messaging (FCM) for instant push notifications to vendors/users.
    *   **Cloud & Storage:** AWS S3 for storing DLs, RCs, and Profile Pictures.

    ## 5. Security & Scaling Checklist
    *   **KYC Integrity:** Vendors MUST remain "Inactive" until Admin manually verifies their uploaded documents.
    *   **Database ACID Properties:** Wallet deductions/refunds must use database transactions to prevent double-spending or money loss during crashes.
    *   **Cron Jobs:** Escalate or Auto-cancel requests if a vendor doesn't respond within 15-30 minutes, triggering automatic refunds.
