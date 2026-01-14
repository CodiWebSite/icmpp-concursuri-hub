import { useParams } from 'react-router-dom';
import { CompetitionDetail } from '@/components/competitions/CompetitionDetail';

export default function CompetitionDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return (
    <div className="container py-8 md:py-12">
      <CompetitionDetail slug={slug} />
    </div>
  );
}
