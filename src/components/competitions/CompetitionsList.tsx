import { useMemo, useState } from 'react';
import { CompetitionCard } from './CompetitionCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, FileX } from 'lucide-react';
import { useCompetitions } from '@/hooks/useCompetitions';
import { getYearFromDate } from '@/lib/dateUtils';
import type { Competition } from '@/lib/types';

interface CompetitionsListProps {
  basePath?: string;
}

export function CompetitionsList({ basePath = '/concursuri' }: CompetitionsListProps) {
  const { data: competitions, isLoading } = useCompetitions();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Get unique years from competitions
  const years = useMemo(() => {
    if (!competitions) return [];
    const yearSet = new Set<number>();
    competitions.forEach(c => {
      const year = getYearFromDate(c.start_date || c.created_at);
      if (year) yearSet.add(year);
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [competitions]);

  // Filter competitions
  const filteredCompetitions = useMemo(() => {
    if (!competitions) return [];
    
    return competitions.filter(c => {
      // Filter by status
      if (c.status !== activeTab) return false;
      
      // Filter by year
      if (selectedYear !== 'all') {
        const year = getYearFromDate(c.start_date || c.created_at);
        if (year?.toString() !== selectedYear) return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(query);
        const matchKeywords = c.keywords?.toLowerCase().includes(query);
        const matchDescription = c.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchKeywords && !matchDescription) return false;
      }
      
      return true;
    });
  }, [competitions, activeTab, selectedYear, searchQuery]);

  if (isLoading) {
    return <CompetitionsListSkeleton />;
  }

  const activeCount = competitions?.filter(c => c.status === 'active').length || 0;
  const archivedCount = competitions?.filter(c => c.status === 'archived').length || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}>
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="active" className="gap-1.5 sm:gap-2 py-2.5 text-xs sm:text-sm">
            <span className="hidden xs:inline">Concursuri</span> Active
            <span className="text-[10px] sm:text-xs bg-status-active text-status-active-foreground px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-1.5 sm:gap-2 py-2.5 text-xs sm:text-sm">
            <span className="hidden xs:inline">Concursuri</span> Arhivate
            <span className="text-[10px] sm:text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              {archivedCount}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Filters - stacked on mobile */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mt-4 sm:mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută concursuri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full sm:w-36 h-11 sm:h-10 text-base sm:text-sm">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="An" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toți anii</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="active" className="mt-4 sm:mt-6">
          <CompetitionsGrid 
            competitions={filteredCompetitions} 
            basePath={basePath}
            emptyMessage="Nu există concursuri active pentru criteriile selectate."
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-4 sm:mt-6">
          <CompetitionsGrid 
            competitions={filteredCompetitions} 
            basePath={basePath}
            emptyMessage="Nu există concursuri arhivate pentru criteriile selectate."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompetitionsGrid({ 
  competitions, 
  basePath, 
  emptyMessage 
}: { 
  competitions: Competition[]; 
  basePath: string;
  emptyMessage: string;
}) {
  if (competitions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-muted/30 rounded-lg border border-dashed">
        <FileX className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-muted-foreground px-4">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map(competition => (
        <CompetitionCard 
          key={competition.id} 
          competition={competition} 
          basePath={basePath}
        />
      ))}
    </div>
  );
}

function CompetitionsListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex gap-2">
        <Skeleton className="h-11 sm:h-10 flex-1" />
        <Skeleton className="h-11 sm:h-10 flex-1" />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Skeleton className="h-11 sm:h-10 flex-1" />
        <Skeleton className="h-11 sm:h-10 w-full sm:w-36" />
      </div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-44 sm:h-48" />
        ))}
      </div>
    </div>
  );
}
