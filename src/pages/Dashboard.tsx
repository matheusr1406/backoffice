import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, FileText, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  pendingReports: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profilesRes, postsRes, reportsRes] = await Promise.all([
          supabase.from("profiles").select("id, status"),
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("post_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);

        const profiles = profilesRes.data || [];
        const totalUsers = profiles.length;
        const activeUsers = profiles.filter((p) => p.status !== false).length;
        const inactiveUsers = profiles.filter((p) => p.status === false).length;
        const totalPosts = postsRes.count || 0;
        const pendingReports = reportsRes.count || 0;

        setStats({ totalUsers, activeUsers, inactiveUsers, totalPosts, pendingReports });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-primary-foreground",
      bgColor: "bg-primary",
    },
    {
      title: "Usuários Ativos",
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Usuários Inativos",
      value: stats?.inactiveUsers ?? 0,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total de Posts",
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: "text-secondary-foreground",
      bgColor: "bg-secondary",
    },
    {
      title: "Denúncias Pendentes",
      value: stats?.pendingReports ?? 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema NearByMe
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
