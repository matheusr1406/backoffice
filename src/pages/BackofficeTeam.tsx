import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Plus, Trash2, Search, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AppRole = "admin" | "moderator";

interface TeamMember {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profile: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  } | null;
}

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
}

export default function BackofficeTeam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");
  const [filterSearchTerm, setFilterSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // Fetch team members (admins and moderators)
  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["backoffice-team"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .in("role", ["admin", "moderator"])
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for each user
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine roles with profiles
      return roles.map((role) => ({
        ...role,
        profile: profiles.find((p) => p.id === role.user_id) || null,
      })) as TeamMember[];
    },
  });

  // Search users for adding
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["search-users", searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .or(`full_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      // Filter out users already in team
      const teamUserIds = teamMembers?.map((m) => m.user_id) || [];
      return (data as UserProfile[]).filter((u) => !teamUserIds.includes(u.id));
    },
    enabled: searchTerm.length >= 2,
  });

  // Add team member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: AppRole;
    }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backoffice-team"] });
      setIsAddDialogOpen(false);
      setSelectedUser(null);
      setSearchTerm("");
      toast({
        title: "Membro adicionado",
        description: "O usuário foi adicionado à equipe com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backoffice-team"] });
      toast({
        title: "Membro removido",
        description: "O usuário foi removido da equipe.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddMember = () => {
    if (!selectedUser) return;
    addMemberMutation.mutate({ userId: selectedUser.id, role: selectedRole });
  };

  const handleRemoveMember = (member: TeamMember) => {
    // Check if trying to remove self
    if (member.user_id === user?.id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode remover a si mesmo da equipe.",
        variant: "destructive",
      });
      return;
    }

    // Check if this is the last admin
    const adminCount = teamMembers?.filter((m) => m.role === "admin").length || 0;
    if (member.role === "admin" && adminCount <= 1) {
      toast({
        title: "Ação não permitida",
        description: "Não é possível remover o último administrador do sistema.",
        variant: "destructive",
      });
      return;
    }

    removeMemberMutation.mutate(member.id);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canRemoveMember = (member: TeamMember) => {
    if (member.user_id === user?.id) return false;
    const adminCount = teamMembers?.filter((m) => m.role === "admin").length || 0;
    if (member.role === "admin" && adminCount <= 1) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Equipe Backoffice
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os administradores e moderadores do sistema
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Membro à Equipe</DialogTitle>
              <DialogDescription>
                Busque um usuário e selecione o tipo de acesso.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou username..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedUser(null);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Search results */}
              {searchTerm.length >= 2 && (
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="divide-y">
                      {searchResults.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => setSelectedUser(profile)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent ${
                            selectedUser?.id === profile.id ? "bg-accent" : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {profile.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{profile.username}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Nenhum usuário encontrado
                    </p>
                  )}
                </div>
              )}

              {/* Selected user */}
              {selectedUser && (
                <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(selectedUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedUser.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{selectedUser.username}
                    </p>
                  </div>
                </div>
              )}

              {/* Role selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de acesso</label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as AppRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Admin</Badge>
                        <span className="text-muted-foreground">
                          - Acesso total
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderator">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Moderador</Badge>
                        <span className="text-muted-foreground">
                          - Acesso limitado
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setSelectedUser(null);
                  setSearchTerm("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUser || addMemberMutation.isPending}
              >
                {addMemberMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Adicionar Membro
              </Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou username..."
            className="pl-10"
            value={filterSearchTerm}
            onChange={(e) => setFilterSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Adicionado em</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTeam ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : teamMembers && teamMembers.length > 0 ? (
              teamMembers
                .filter((member) => {
                  const matchesSearch =
                    filterSearchTerm === "" ||
                    member.profile?.full_name
                      .toLowerCase()
                      .includes(filterSearchTerm.toLowerCase()) ||
                    member.profile?.username
                      .toLowerCase()
                      .includes(filterSearchTerm.toLowerCase());
                  const matchesRole =
                    filterRole === "all" || member.role === filterRole;
                  return matchesSearch && matchesRole;
                })
                .map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={member.profile?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {member.profile
                            ? getInitials(member.profile.full_name)
                            : "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profile?.full_name || "Usuário desconhecido"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{member.profile?.username || "unknown"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.role === "admin" ? "default" : "secondary"}
                    >
                      {member.role === "admin" ? "Admin" : "Moderador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(member.created_at), "dd 'de' MMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!canRemoveMember(member)}
                                className="hover:bg-primary hover:text-primary-foreground [&_svg]:hover:text-primary-foreground transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Remover membro</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover membro</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover{" "}
                            <strong>{member.profile?.full_name}</strong> da equipe
                            do backoffice? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <p className="text-muted-foreground">
                    Nenhum membro na equipe
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
