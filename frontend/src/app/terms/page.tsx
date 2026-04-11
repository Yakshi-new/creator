'use client';

import PolicyLayout from '@/components/PolicyLayout';

export default function TermsPage() {
    return (
        <PolicyLayout title="Terms of Service">
            <h2 className="text-2xl font-black mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                By accessing or using CREATOR HUB, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of those changes.
            </p>

            <h2 className="text-2xl font-black mb-4">2. Age Requirement</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                You must be at least 18 years of age to use CREATOR HUB. By creating an account, you represent and warrant that you are 18 years older and have the legal capacity to form a binding contract. 
            </p>

            <h2 className="text-2xl font-black mb-4">3. User Conduct</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                You are responsible for all activity that occurs under your account. You agree not to use the platform for any illegal purpose or to violate any laws in your jurisdiction. Any attempt to disrupt the service or compromise our security will result in immediate termination.
            </p>

            <h2 className="text-2xl font-black mb-4">4. IP Rights</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                Creators retain all ownership of the content they post. By posting content, you grant CREATOR HUB a non-exclusive license to host and distribute that content to your subscribers.
            </p>
        </PolicyLayout>
    );
}
