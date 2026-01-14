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
import { Plus, Trash2, Users, AlertCircle, Shield, Loader2, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  user_id: string;
  role: 'admin' | 'editor';
  email: string;
}

export default function AdminUsersPage() {
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ userId: string; roleId: string } | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor'>('editor');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [createdUserInfo, setCreatedUserInfo] = useState<{ email: string; password: string } | null>(null);

  // Fetch users via edge function
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      return response.data.users as UserWithRole[];
    },
    enabled: isAdmin,
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleOpenDialog = () => {
    const tempPass = generatePassword();
    setNewPassword(tempPass);
    setNewEmail('');
    setNewRole('editor');
    setCreatedUserInfo(null);
    setIsDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newEmail.endsWith('@icmpp.ro')) {
      toast.error('Email-ul trebuie să fie @icmpp.ro');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('create-user', {
        body: { email: newEmail, password: newPassword, role: newRole },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        toast.error(response.error.message || 'Eroare la crearea utilizatorului.');
        return;
      }

      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }

      setCreatedUserInfo({ email: newEmail, password: newPassword });
      toast.success('Utilizator creat cu succes!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      toast.error('Eroare la crearea utilizatorului.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('delete-user', {
        body: { userId: userToDelete.userId, roleId: userToDelete.roleId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error || response.data.error) {
        toast.error(response.data?.error || 'Eroare la ștergerea utilizatorului.');
        return;
      }

      toast.success('Utilizator șters.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      toast.error('Eroare la ștergerea utilizatorului.');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const copyPassword = () => {
    if (createdUserInfo) {
      navigator.clipboard.writeText(createdUserInfo.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
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
        <Button onClick={handleOpenDialog}>
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
          ) : usersData && usersData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrator' : 'Editor'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setUserToDelete({ userId: user.user_id, roleId: user.id });
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
            <DialogTitle>
              {createdUserInfo ? 'Utilizator creat!' : 'Adaugă utilizator'}
            </DialogTitle>
            <DialogDescription>
              {createdUserInfo 
                ? 'Transmiteți aceste credențiale utilizatorului.'
                : 'Creează un cont nou pentru un utilizator ICMPP'}
            </DialogDescription>
          </DialogHeader>

          {createdUserInfo ? (
            <div className="space-y-4 py-4">
              <Alert>
                <AlertDescription className="space-y-3">
                  <div>
                    <strong>Email:</strong> {createdUserInfo.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Parolă temporară:</strong>
                    <code className="bg-muted px-2 py-1 rounded">{createdUserInfo.password}</code>
                    <Button variant="ghost" size="icon" onClick={copyPassword}>
                      {copiedPassword ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Utilizatorul își poate schimba parola după autentificare.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email utilizator</Label>
                <Input
                  id="email"
                  placeholder="utilizator@icmpp.ro"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parolă temporară</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setNewPassword(generatePassword())}>
                    Generează
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Utilizatorul o poate schimba ulterior.
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
          )}

          <DialogFooter>
            {createdUserInfo ? (
              <Button onClick={() => setIsDialogOpen(false)}>Închide</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Anulează
                </Button>
                <Button onClick={handleCreateUser} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Creează utilizator
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergeți utilizatorul?</AlertDialogTitle>
            <AlertDialogDescription>
              Utilizatorul va fi șters definitiv și va pierde accesul la aplicație.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge utilizator
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
