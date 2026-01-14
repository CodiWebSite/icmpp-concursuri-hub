import { CompetitionsList } from '@/components/competitions/CompetitionsList';

export default function EmbedCompetitionsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold mb-1">
          Concursuri ICMPP
        </h1>
        <p className="text-muted-foreground">
          Lista concursurilor pentru posturi disponibile
        </p>
      </div>
      
      <CompetitionsList basePath="/embed/concursuri" />
    </div>
  );
}
