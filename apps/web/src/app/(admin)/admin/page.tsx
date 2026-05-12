import type { Metadata } from 'next';
import { OverviewSection } from './_components/OverviewSection';
import { PetitionsSection } from './_components/PetitionsSection';
import { SignaturesSection } from './_components/SignaturesSection';
import { DonationsSection } from './_components/DonationsSection';
import { ReclassifyButton } from './_components/ReclassifyButton';

export const metadata: Metadata = { title: '관리자 대시보드' };

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <ReclassifyButton />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Overview
        </h2>
        <OverviewSection />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          청원
        </h2>
        <PetitionsSection />
      </section>

      <section id="signatures">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          서명 인구통계{' '}
          <span className="text-xs font-normal text-gray-400">(동의자 한정)</span>
        </h2>
        <SignaturesSection />
      </section>

      <section id="donations">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          후원
        </h2>
        <DonationsSection />
      </section>
    </div>
  );
}
