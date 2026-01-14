import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';
import { useCompetitionById, useCreateCompetition, useUpdateCompetition } from '@/hooks/useCompetitions';
import { generateSlug } from '@/lib/dateUtils';
import { toast } from 'sonner';
import { DocumentsManager } from '@/components/admin/DocumentsManager';

const competitionSchema = z.object({
  title: z.string().min(1, 'Titlul este obligatoriu.'),
  slug: z.string().min(1, 'Slug-ul este obligatoriu.'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  keywords: z.string().optional(),
  auto_archive: z.boolean(),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

export default function AdminCompetitionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: competition, isLoading } = useCompetitionById(id || '');
  const createCompetition = useCreateCompetition();
  const updateCompetition = useUpdateCompetition();

  const form = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      status: 'active',
      start_date: '',
      end_date: '',
      keywords: '',
      auto_archive: false,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (competition) {
      form.reset({
        title: competition.title,
        slug: competition.slug,
        description: competition.description || '',
        status: competition.status,
        start_date: competition.start_date || '',
        end_date: competition.end_date || '',
        keywords: competition.keywords || '',
        auto_archive: competition.auto_archive,
      });
    }
  }, [competition, form]);

  // Auto-generate slug from title
  const watchTitle = form.watch('title');
  useEffect(() => {
    if (!isEditing && watchTitle) {
      form.setValue('slug', generateSlug(watchTitle));
    }
  }, [watchTitle, isEditing, form]);

  const onSubmit = async (data: CompetitionFormData) => {
    try {
      if (isEditing) {
        await updateCompetition.mutateAsync({ id, ...data });
        toast.success('Concursul a fost actualizat.');
      } else {
        const competitionData = {
          title: data.title,
          slug: data.slug,
          description: data.description || null,
          status: data.status,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          keywords: data.keywords || null,
          auto_archive: data.auto_archive,
        };
        await createCompetition.mutateAsync(competitionData);
        toast.success('Concursul a fost creat.');
        navigate('/admin/concursuri');
      }
    } catch (error) {
      toast.error('Eroare la salvarea concursului.');
    }
  };

  const isPending = createCompetition.isPending || updateCompetition.isPending;

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/concursuri">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold">
              {isEditing ? 'Editare concurs' : 'Concurs nou'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Modifică detaliile concursului' : 'Completează detaliile concursului'}
            </p>
          </div>
        </div>
        {isEditing && competition && (
          <Button variant="outline" asChild>
            <Link to={`/concursuri/${competition.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Vezi public
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Detalii concurs</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titlu concurs *</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Concurs pentru post de CS II" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL) *</FormLabel>
                        <FormControl>
                          <Input placeholder="concurs-post-cs-ii" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL: /concursuri/{field.value || 'slug'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descriere</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrierea concursului..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data publicării</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data încheierii</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuvinte cheie</FormLabel>
                        <FormControl>
                          <Input placeholder="CS, cercetător, chimie (separate prin virgulă)" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate prin virgulă, pentru căutare
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" asChild>
                      <Link to="/admin/concursuri">Anulează</Link>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Salvează' : 'Creează'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Documents section - only show when editing */}
          {isEditing && id && (
            <DocumentsManager competitionId={id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Publicare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activ</SelectItem>
                        <SelectItem value="archived">Arhivat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_archive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Auto-arhivare</FormLabel>
                      <FormDescription className="text-xs">
                        Arhivează automat după data încheierii
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
