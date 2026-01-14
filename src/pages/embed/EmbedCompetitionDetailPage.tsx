import { useParams } from 'react-router-dom';
import { CompetitionDetail } from '@/components/competitions/CompetitionDetail';

export default function EmbedCompetitionDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return (
    <CompetitionDetail 
      slug={slug} 
      backPath="/embed/concursuri"
      backLabel="Înapoi la concursuri"
    />
  );
}
