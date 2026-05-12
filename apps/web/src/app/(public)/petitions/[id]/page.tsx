import type { Metadata } from 'next';
import { PetitionDetail } from '@/components/petitions/PetitionDetail';

interface Props {
  params: { id: string };
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `청원 상세 | Change`,
    description: `청원 ${params.id} 상세 페이지`,
  };
}

export default function PetitionDetailPage({ params }: Props) {
  return <PetitionDetail petitionId={params.id} />;
}
