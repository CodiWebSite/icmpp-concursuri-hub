import { CompetitionsList } from '@/components/competitions/CompetitionsList';
import { Award } from 'lucide-react';

export default function CompetitionsPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-primary rounded-lg">
          <Award className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold">
            Concursuri ICMPP
          </h1>
          <p className="text-sm text-muted-foreground">
            Posturi disponibile la institut
          </p>
        </div>
      </div>
      
      <CompetitionsList />
    </div>
  );
}
