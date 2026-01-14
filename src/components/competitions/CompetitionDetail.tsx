import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  FileText, 
  ExternalLink,
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-semibold mb-4">Concurs negăsit</h2>
        <p className="text-muted-foreground mb-6">
          Concursul solicitat nu a fost găsit sau a fost șters.
        </p>
        <Button asChild>
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
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link to={backPath}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <Badge
            className={cn(
              competition.status === 'active'
                ? 'status-badge-active'
                : 'status-badge-archived'
            )}
          >
            {competition.status === 'active' ? 'ACTIV' : 'ARHIVAT'}
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
          {competition.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Publicat: {formatDateLongRO(competition.start_date || competition.created_at)}</span>
          </div>
          {competition.end_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Încheiere: {formatDateLongRO(competition.end_date)}</span>
            </div>
          )}
        </div>

        {competition.keywords && (
          <div className="flex flex-wrap gap-2">
            {competition.keywords.split(',').map((keyword, i) => (
              <Badge key={i} variant="secondary">
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
          <CardHeader>
            <CardTitle className="text-lg font-serif">Descriere</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{competition.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documente concurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {competition.competition_documents && competition.competition_documents.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Nr.</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead className="w-28">Dată</TableHead>
                    <TableHead className="w-24 text-right">Descarcă</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competition.competition_documents.map((doc, index) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateRO(doc.doc_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-1.5"
                        >
                          <a
                            href={getFileUrl(doc.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.file_name}
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Descarcă</span>
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nu există documente atașate acestui concurs.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CompetitionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
