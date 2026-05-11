import { PetitionDetail } from '@/components/petitions/PetitionDetail';

interface Props {
  params: { id: string };
}

export default function PetitionDetailPage({ params }: Props) {
  return <PetitionDetail petitionId={params.id} />;
}
