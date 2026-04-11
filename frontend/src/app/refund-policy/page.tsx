'use client';

import PolicyLayout from '@/components/PolicyLayout';

export default function RefundPage() {
    return (
        <PolicyLayout title="Refund Policy">
            <h2 className="text-2xl font-black mb-4">1. Subscription Refunds</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed font-medium">
                In general, all subscriptions and tips are non-refundable. Once a digital post is unlocked or a subscription period has started, we are unable to issue a refund.
            </p>

            <h2 className="text-2xl font-black mb-4">2. Technical Issues</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                If you encounter a technical issue that prevents you from accessing content you have paid for, please contact our support team within 48 hours. We will review each case individually to determine if a credit or refund is warranted.
            </p>

            <h2 className="text-2xl font-black mb-4">3. Account Termination</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed font-medium">
                Accounts terminated for violations of our Terms of Service or Content Policy are not eligible for refunds.
            </p>

            <h2 className="text-2xl font-black mb-4">4. Fraudulent Transactions</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                We take fraud seriously. Any unauthorized transactions should be reported to your bank immediately. We work closely with payment processors to investigate and resolve fraudulent activity.
            </p>
        </PolicyLayout>
    );
}
