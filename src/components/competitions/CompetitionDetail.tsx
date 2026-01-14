import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  FileText, 
  FileIcon
} from 'lucide-react';
import { useCompetition } from '@/hooks/useCompetitions';
import { formatDateRO, formatDateLongRO } from '@/lib/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CompetitionDetailProps {
  slug: string;
  backPath?: string;
  backLabel?: string;
}

export function CompetitionDetail({ 
  slug, 
  backPath = '/concursuri',
  backLabel = 'Înapoi la concursuri'
}: CompetitionDetailProps) {
  const { data: competition, isLoading, error } = useCompetition(slug);

  if (isLoading) {
    return <CompetitionDetailSkeleton />;
  }

  if (error || !competition) {
    return (
      <div className="text-center py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-serif font-semibold mb-3 sm:mb-4">Concurs negăsit</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
          Concursul solicitat nu a fost găsit sau a fost șters.
        </p>
        <Button asChild size="lg" className="h-11 sm:h-10">
          <Link to={backPath}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      </div>
    );
  }

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('competition-documents')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2 h-10 sm:h-9 text-sm">
        <Link to={backPath}>
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{backLabel}</span>
          <span className="sm:hidden">Înapoi</span>
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-start gap-2 sm:gap-3">
          <Badge
            className={cn(
              'text-xs',
              competition.status === 'active'
                ? 'status-badge-active'
                : 'status-badge-archived'
            )}
          >
            {competition.status === 'active' ? 'ACTIV' : 'ARHIVAT'}
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight">
          {competition.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Publicat: {formatDateLongRO(competition.start_date || competition.created_at)}</span>
          </div>
          {competition.end_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Încheiere: {formatDateLongRO(competition.end_date)}</span>
            </div>
          )}
        </div>

        {competition.keywords && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {competition.keywords.split(',').map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {keyword.trim()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      {competition.description && (
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-serif">Descriere</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm sm:text-base">{competition.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-serif flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Documente concurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {competition.competition_documents && competition.competition_documents.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {competition.competition_documents.map((doc, index) => (
                <div 
                  key={doc.id} 
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-muted-foreground w-6 shrink-0">
                      {index + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base">{doc.title}</p>
                      {doc.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateRO(doc.doc_date)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full sm:w-auto h-10 sm:h-9 shrink-0"
                  >
                    <a
                      href={getFileUrl(doc.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.file_name}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descarcă
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <FileIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-sm">Nu există documente atașate acestui concurs.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CompetitionDetailSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Skeleton className="h-10 w-32 sm:w-48" />
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-6 w-16 sm:w-20" />
        <Skeleton className="h-8 sm:h-12 w-full sm:w-3/4" />
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Skeleton className="h-5 w-32 sm:w-40" />
          <Skeleton className="h-5 w-32 sm:w-40" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-32 sm:h-40 w-full" />
      <Skeleton className="h-48 sm:h-64 w-full" />
    </div>
  );
}
