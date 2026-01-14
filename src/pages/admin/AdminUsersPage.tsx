import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Trash2, Users, AlertCircle, Shield, Pencil } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/types';

interface UserRoleWithEmail extends UserRole {
  email?: string;
}

export default function AdminUsersPage() {
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor'>('editor');

  // Fetch user roles - in a real app, you'd join with auth.users
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('role', { ascending: true });
      
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const addUserRole = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'admin' | 'editor' }) => {
      // First, find the user by email in auth.users (this requires admin API or edge function)
      // For now, we'll show a message that the user needs to log in first
      toast.info('Utilizatorul trebuie să se autentifice prima dată. După aceea, reveniți pentru a-i atribui rolul.');
      throw new Error('Utilizatorul trebuie să existe în sistem.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setIsDialogOpen(false);
      setNewEmail('');
      setNewRole('editor');
    },
  });

  const deleteUserRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Rolul a fost eliminat.');
    },
    onError: () => {
      toast.error('Eroare la eliminarea rolului.');
    },
  });

  const handleDelete = () => {
    if (roleToDelete) {
      deleteUserRole.mutate(roleToDelete);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  if (isLoadingAdmin) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Gestionare utilizatori</h1>
          <p className="text-muted-foreground">
            Administrează utilizatorii și rolurile acestora
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nu aveți permisiunea de a gestiona utilizatori. Doar administratorii pot accesa această pagină.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Gestionare utilizatori</h1>
          <p className="text-muted-foreground">
            Administrează utilizatorii și rolurile acestora
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adaugă utilizator
        </Button>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Roluri disponibile:</strong>
          <ul className="mt-2 list-disc list-inside text-sm">
            <li><strong>Admin</strong> - acces complet, poate gestiona utilizatori și concursuri</li>
            <li><strong>Editor</strong> - poate crea și edita concursuri și documente</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif">Utilizatori cu acces</CardTitle>
          <CardDescription>
            Doar utilizatorii cu email @icmpp.ro pot avea roluri
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : userRoles && userRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Utilizator</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-mono text-sm">
                      {role.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.role === 'admin' ? 'default' : 'secondary'}>
                        {role.role === 'admin' ? 'Administrator' : 'Editor'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setRoleToDelete(role.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nu există utilizatori cu roluri definite.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă utilizator</DialogTitle>
            <DialogDescription>
              Atribuie un rol unui utilizator ICMPP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email utilizator</Label>
              <Input
                id="email"
                placeholder="utilizator@icmpp.ro"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Utilizatorul trebuie să se fi autentificat cel puțin o dată.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as 'admin' | 'editor')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={() => addUserRole.mutate({ email: newEmail, role: newRole })}>
              Adaugă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminați rolul?</AlertDialogTitle>
            <AlertDialogDescription>
              Utilizatorul va pierde accesul la panoul de administrare.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimină rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
