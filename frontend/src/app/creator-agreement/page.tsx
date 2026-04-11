'use client';

import PolicyLayout from '@/components/PolicyLayout';
import { Scale, Fingerprint, Banknote } from 'lucide-react';

export default function CreatorAgreementPage() {
    return (
        <PolicyLayout title="Creator Agreement">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <Fingerprint className="text-blue-500" size={24} />
                1. Identity Verification (KYC)
            </h2>
            <p className="text-neutral-400 mb-8 leading-relaxed font-medium">
                To maintain a safe and legal platform, every creator is required to complete a Know Your Customer (KYC) verification process. This includes submitting a valid government-issued ID and potentially a live selfie. Failure to complete or pass KYC will result in the inability to monetize content or withdraw funds.
            </p>

            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <Banknote className="text-emerald-500" size={24} />
                2. Payouts and Fees
            </h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                Creators earn revenue from subscriptions and individual post sales. CREATOR HUB retains a platform fee of 25% (subject to change with notice). Payouts are processed on a regular schedule, provided the creator has met the minimum payout threshold and passed all verification checks.
            </p>

            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <Scale className="text-rose-500" size={24} />
                3. Compliance
            </h2>
            <p className="text-neutral-400 mb-8 leading-relaxed font-medium">
                By becoming a creator, you agree to comply with all platform policies, including our strict no-adult content rules. You are also responsible for reporting and paying any taxes applicable to your earnings in your jurisdiction.
            </p>

            <h2 className="text-2xl font-black mb-4">4. Relationship</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                This agreement does not create an employment, partnership, or joint venture relationship. Creators are independent contractors of the platform.
            </p>
        </PolicyLayout>
    );
}
