import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, FileText, Users, Plus, ArrowRight, CheckCircle, Archive } from 'lucide-react';
import { useCompetitions } from '@/hooks/useCompetitions';

export default function AdminDashboard() {
  const { data: competitions, isLoading } = useCompetitions();

  const activeCount = competitions?.filter(c => c.status === 'active').length || 0;
  const archivedCount = competitions?.filter(c => c.status === 'archived').length || 0;
  const totalDocuments = 0; // Would need a separate query

  const stats = [
    {
      title: 'Concursuri active',
      value: activeCount,
      icon: CheckCircle,
      color: 'text-status-active',
      bgColor: 'bg-status-active/10',
    },
    {
      title: 'Concursuri arhivate',
      value: archivedCount,
      icon: Archive,
      color: 'text-status-archived',
      bgColor: 'bg-status-archived/10',
    },
    {
      title: 'Total concursuri',
      value: (competitions?.length || 0),
      icon: Trophy,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Panou principal</h1>
          <p className="text-muted-foreground">
            Bine ați venit în panoul de administrare
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/concursuri/nou">
            <Plus className="mr-2 h-4 w-4" />
            Adaugă concurs
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Acțiuni rapide</CardTitle>
            <CardDescription>Gestionează concursurile și documentele</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/admin/concursuri">
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Vezi toate concursurile
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/admin/concursuri/nou">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Creează concurs nou
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/admin/utilizatori">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gestionează utilizatori
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Concursuri recente</CardTitle>
            <CardDescription>Ultimele concursuri adăugate</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : competitions && competitions.length > 0 ? (
              <div className="space-y-3">
                {competitions.slice(0, 3).map(competition => (
                  <Link
                    key={competition.id}
                    to={`/admin/concursuri/${competition.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{competition.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {competition.status === 'active' ? 'Activ' : 'Arhivat'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                Nu există concursuri încă.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
