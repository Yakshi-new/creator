'use client';

import PolicyLayout from '@/components/PolicyLayout';
import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

export default function ContentPolicyPage() {
    return (
        <PolicyLayout title="Content Policy">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 mb-12 flex gap-6 items-start">
                <div className="p-3 bg-rose-500 text-white rounded-2xl shrink-0">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-rose-500 mb-2">Strict No-Adult Content Policy</h3>
                    <p className="text-neutral-400 font-medium mb-4">CREATOR HUB is a non-adult platform. We maintain a professional environment for all creators and fans. Explicit adult content is strictly prohibited.</p>
                    <div className="bg-black/40 border border-rose-500/20 rounded-2xl p-4 italic text-sm text-neutral-300">
                        "Creators are prohibited from uploading pornographic or sexually explicit content. Violation may lead to account termination."
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <XCircle className="text-rose-500" size={24} /> 
                Prohibited Content
            </h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
                Creators are strictly prohibited from uploading, posting, or sharing the following:
            </p>
            <ul className="list-disc list-inside text-neutral-400 space-y-3 mb-12 ml-4 font-medium">
                <li>Pornographic or sexually explicit content.</li>
                <li>Full nudity or suggestive sexual acts.</li>
                <li>Gratuitous violence or gore.</li>
                <li>Hate speech or harassment.</li>
                <li>Content that promotes illegal activities.</li>
            </ul>

            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={24} />
                Account Termination
            </h2>
            <p className="text-neutral-400 mb-8 leading-relaxed font-medium">
                Violation of our Content Policy will lead to immediate account suspension or termination without refund of any remaining balance. We use both automated systems and manual moderation to enforce these rules.
            </p>

            <h2 className="text-2xl font-black mb-4">Intellectual Property</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">
                You must own or have the necessary rights to all content you post. Copyright infringement is taken seriously and will result in content removal and potential account closure.
            </p>
        </PolicyLayout>
    );
}
