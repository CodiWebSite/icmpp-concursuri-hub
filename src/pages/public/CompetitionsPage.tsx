import { CompetitionsList } from '@/components/competitions/CompetitionsList';
import { Award } from 'lucide-react';

export default function CompetitionsPage() {
  return (
    <div>
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-primary rounded-lg shrink-0">
          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold truncate">
            Concursuri ICMPP
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Posturi disponibile la institut
          </p>
        </div>
      </div>
      
      <CompetitionsList />
    </div>
  );
}
