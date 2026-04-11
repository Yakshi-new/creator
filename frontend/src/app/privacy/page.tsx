'use client';

import PolicyLayout from '@/components/PolicyLayout';

export default function PrivacyPage() {
    return (
        <PolicyLayout title="Privacy Policy">
            <h2 className="text-2xl font-black mb-4">1. Information We Collect</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This include your name, email address, password, and payment information.
            </p>

            <h2 className="text-2xl font-black mb-4">2. How We Use Information</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you about your account and platform updates.
            </p>

            <h2 className="text-2xl font-black mb-4">3. Data Security</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-black mb-4">4. Sharing of Information</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                We do not sell your personal information. We may share information with service providers who perform services on our behalf, such as payment processing and data hosting.
            </p>
        </PolicyLayout>
    );
}
