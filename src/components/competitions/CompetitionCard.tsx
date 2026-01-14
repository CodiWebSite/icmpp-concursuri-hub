import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatDateRO } from '@/lib/dateUtils';
import type { Competition } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CompetitionCardProps {
  competition: Competition;
  basePath?: string;
}

export function CompetitionCard({ competition, basePath = '/concursuri' }: CompetitionCardProps) {
  return (
    <Card className="card-hover animate-fade-in flex flex-col">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold leading-tight text-foreground line-clamp-2">
            {competition.title}
          </h3>
          <Badge
            className={cn(
              'shrink-0 text-[10px] sm:text-xs',
              competition.status === 'active'
                ? 'status-badge-active'
                : 'status-badge-archived'
            )}
          >
            {competition.status === 'active' ? 'ACTIV' : 'ARHIVAT'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 sm:pb-3 flex-1">
        <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>Publicat: {formatDateRO(competition.start_date || competition.created_at)}</span>
          </div>
          {competition.end_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Încheiere: {formatDateRO(competition.end_date)}</span>
            </div>
          )}
        </div>
        {competition.keywords && (
          <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
            {competition.keywords.split(',').slice(0, 3).map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs">
                {keyword.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full group h-10 sm:h-9 text-sm">
          <Link to={`${basePath}/${competition.slug}`}>
            Vezi detalii
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
