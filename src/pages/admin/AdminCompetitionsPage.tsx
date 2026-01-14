import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Pencil, Archive, RotateCcw, Trash2, Eye, FileX } from 'lucide-react';
import { useCompetitions, useUpdateCompetition, useDeleteCompetition } from '@/hooks/useCompetitions';
import { formatDateRO } from '@/lib/dateUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminCompetitionsPage() {
  const { data: competitions, isLoading } = useCompetitions();
  const updateCompetition = useUpdateCompetition();
  const deleteCompetition = useDeleteCompetition();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [competitionToDelete, setCompetitionToDelete] = useState<string | null>(null);

  const filteredCompetitions = competitions?.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.keywords?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArchive = async (id: string) => {
    try {
      await updateCompetition.mutateAsync({ id, status: 'archived' });
      toast.success('Concursul a fost mutat la arhivate.');
    } catch (error) {
      toast.error('Eroare la arhivarea concursului.');
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await updateCompetition.mutateAsync({ id, status: 'active' });
      toast.success('Concursul a fost reactivat.');
    } catch (error) {
      toast.error('Eroare la reactivarea concursului.');
    }
  };

  const handleDelete = async () => {
    if (!competitionToDelete) return;
    
    try {
      await deleteCompetition.mutateAsync(competitionToDelete);
      toast.success('Concursul a fost șters.');
    } catch (error) {
      toast.error('Eroare la ștergerea concursului.');
    } finally {
      setDeleteDialogOpen(false);
      setCompetitionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Concursuri</h1>
          <p className="text-muted-foreground">
            Gestionează toate concursurile institutului
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/concursuri/nou">
            <Plus className="mr-2 h-4 w-4" />
            Adaugă concurs
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-serif">Lista concursurilor</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCompetitions && filteredCompetitions.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titlu</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-28">Publicat</TableHead>
                    <TableHead className="w-28">Încheiere</TableHead>
                    <TableHead className="w-20 text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompetitions.map(competition => (
                    <TableRow key={competition.id}>
                      <TableCell>
                        <Link 
                          to={`/admin/concursuri/${competition.id}`}
                          className="font-medium hover:underline"
                        >
                          {competition.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            competition.status === 'active'
                              ? 'status-badge-active'
                              : 'status-badge-archived'
                          )}
                        >
                          {competition.status === 'active' ? 'Activ' : 'Arhivat'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateRO(competition.start_date || competition.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateRO(competition.end_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/concursuri/${competition.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                Vezi public
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/concursuri/${competition.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editează
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {competition.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleArchive(competition.id)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Mută la arhivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleReactivate(competition.id)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reactivează
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setCompetitionToDelete(competition.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Șterge
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Nu s-au găsit concursuri.' : 'Nu există concursuri încă.'}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/admin/concursuri/nou">
                    <Plus className="mr-2 h-4 w-4" />
                    Adaugă primul concurs
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergeți concursul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Concursul și toate documentele asociate vor fi șterse permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
