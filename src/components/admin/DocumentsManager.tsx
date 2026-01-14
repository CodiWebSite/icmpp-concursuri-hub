import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Pencil, Trash2, GripVertical, FileText, Loader2 } from 'lucide-react';
import { useCompetitionDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, useReorderDocuments } from '@/hooks/useCompetitions';
import { supabase } from '@/integrations/supabase/client';
import { formatDateRO } from '@/lib/dateUtils';
import { toast } from 'sonner';
import type { CompetitionDocument } from '@/lib/types';

interface DocumentsManagerProps {
  competitionId: string;
}

export function DocumentsManager({ competitionId }: DocumentsManagerProps) {
  const { data: documents, isLoading } = useCompetitionDocuments(competitionId);
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  const reorderDocuments = useReorderDocuments();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CompetitionDocument | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [docDate, setDocDate] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDocDate('');
    setDescription('');
    setFile(null);
    setEditingDocument(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (doc: CompetitionDocument) => {
    setEditingDocument(doc);
    setTitle(doc.title);
    setDocDate(doc.doc_date || '');
    setDescription(doc.description || '');
    setFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Titlul documentului este obligatoriu.');
      return;
    }

    if (!editingDocument && !file) {
      toast.error('Selectați un fișier pentru încărcare.');
      return;
    }

    setIsUploading(true);

    try {
      let filePath = editingDocument?.file_path;
      let fileName = editingDocument?.file_name;
      let fileType = editingDocument?.file_type;

      // Upload new file if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const uniqueName = `${competitionId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('competition-documents')
          .upload(uniqueName, file);

        if (uploadError) throw uploadError;

        filePath = uniqueName;
        fileName = file.name;
        fileType = file.type;
      }

      if (editingDocument) {
        await updateDocument.mutateAsync({
          id: editingDocument.id,
          title,
          doc_date: docDate || null,
          description: description || null,
          ...(file && { file_path: filePath, file_name: fileName, file_type: fileType }),
        });
        toast.success('Documentul a fost actualizat.');
      } else {
        const maxOrder = documents?.reduce((max, d) => Math.max(max, d.order_index), -1) ?? -1;
        
        await createDocument.mutateAsync({
          competition_id: competitionId,
          title,
          doc_date: docDate || null,
          description: description || null,
          file_path: filePath!,
          file_name: fileName!,
          file_type: fileType || null,
          order_index: maxOrder + 1,
        });
        toast.success('Documentul a fost adăugat.');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Eroare la salvarea documentului.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument.mutateAsync({ id: documentToDelete, competitionId });
      toast.success('Documentul a fost șters.');
    } catch (error) {
      toast.error('Eroare la ștergerea documentului.');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const moveDocument = async (index: number, direction: 'up' | 'down') => {
    if (!documents) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= documents.length) return;

    const newDocs = [...documents];
    [newDocs[index], newDocs[newIndex]] = [newDocs[newIndex], newDocs[index]];

    const updates = newDocs.map((doc, i) => ({
      id: doc.id,
      order_index: i,
      competition_id: competitionId,
    }));

    try {
      await reorderDocuments.mutateAsync(updates);
    } catch (error) {
      toast.error('Eroare la reordonarea documentelor.');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Documente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-serif">Documente concurs</CardTitle>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Adaugă document
          </Button>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-10">Nr.</TableHead>
                    <TableHead>Titlu</TableHead>
                    <TableHead className="w-28">Dată</TableHead>
                    <TableHead className="w-28 text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc, index) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveDocument(index, 'up')}
                            disabled={index === 0}
                          >
                            <GripVertical className="h-4 w-4 rotate-90" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {doc.file_name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateRO(doc.doc_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(doc)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDocumentToDelete(doc.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Nu există documente atașate.
              </p>
              <Button onClick={openAddDialog} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Adaugă primul document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? 'Editare document' : 'Document nou'}
            </DialogTitle>
            <DialogDescription>
              {editingDocument
                ? 'Modifică detaliile documentului.'
                : 'Completează detaliile și încarcă fișierul.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Titlu document *</Label>
              <Input
                id="doc-title"
                placeholder="ex: Anunț rezultate - selecție dosare"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-date">Data document</Label>
              <Input
                id="doc-date"
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-description">Descriere (opțional)</Label>
              <Textarea
                id="doc-description"
                placeholder="Descriere scurtă..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-file">
                Fișier {!editingDocument && '*'}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="doc-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                />
              </div>
              {editingDocument && !file && (
                <p className="text-xs text-muted-foreground">
                  Fișier actual: {editingDocument.file_name}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Formate acceptate: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Se încarcă...' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergeți documentul?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă. Documentul va fi șters permanent.
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
    </>
  );
}
