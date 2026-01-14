import { CompetitionsList } from '@/components/competitions/CompetitionsList';

export default function CompetitionsPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
          Concursuri ICMPP
        </h1>
        <p className="text-muted-foreground text-lg">
          Consultați lista concursurilor pentru posturi disponibile la institutul nostru.
        </p>
      </div>
      
      <CompetitionsList />
    </div>
  );
}
