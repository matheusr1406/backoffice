import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  post: {
    id: string;
    title: string | null;
    content: string;
    city: string | null;
    state: string | null;
    images: string[] | null;
    deleted_at: string | null;
    author: {
      id: string;
      username: string;
      full_name: string;
      avatar_url: string | null;
    };
  };
  reporter: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface UseCommunityReportsOptions {
  statusFilter?: string;
  reasonFilter?: string;
  searchTerm?: string;
}

export function useCommunityReports(options: UseCommunityReportsOptions = {}) {
  const {
    statusFilter = "all",
    reasonFilter = "all",
    searchTerm = "",
  } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ["community-reports", statusFilter, reasonFilter, searchTerm],
    queryFn: async () => {
      let relevantPostIds: string[] = [];
      const relevantProfileIds: string[] = [];

      if (searchTerm) {
        const { data: matchingPosts } = await supabase
          .from("posts")
          .select("id, author_id")
          .or(`content.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);

        if (matchingPosts) {
          relevantPostIds = matchingPosts.map((p) => p.id);
          relevantProfileIds.push(...matchingPosts.map((p) => p.author_id));
        }

        const { data: matchingProfiles } = await supabase
          .from("profiles")
          .select("id")
          .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);

        if (matchingProfiles) {
          const profileIds = matchingProfiles.map((p) => p.id);
          relevantProfileIds.push(...profileIds);

          const { data: postsByAuthors } = await supabase
            .from("posts")
            .select("id")
            .in("author_id", profileIds);

          if (postsByAuthors) {
            relevantPostIds.push(...postsByAuthors.map((p) => p.id));
          }
        }
      }

      let query = supabase
        .from("post_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (reasonFilter !== "all") {
        query = query.eq("reason", reasonFilter);
      }

      const { data: reportsData, error } = await query;

      if (error) throw error;

      if (!reportsData || reportsData.length === 0) {
        return [];
      }

      let filteredReports = reportsData;
      if (
        searchTerm &&
        (relevantPostIds.length > 0 || relevantProfileIds.length > 0)
      ) {
        filteredReports = reportsData.filter((report) => {
          const postMatches = relevantPostIds.includes(report.post_id);
          const reporterMatches = relevantProfileIds.includes(
            report.reporter_id,
          );

          return postMatches || reporterMatches;
        });
      } else if (searchTerm) {
        return [];
      }

      if (filteredReports.length === 0) {
        return [];
      }

      const postIds = [...new Set(filteredReports.map((r) => r.post_id))];
      const reporterIds = [
        ...new Set(filteredReports.map((r) => r.reporter_id)),
      ];

      const { data: postsData } = await supabase
        .from("posts")
        .select(
          "id, title, content, city, state, images, author_id, deleted_at",
        )
        .in("id", postIds);

      const authorIds = postsData
        ? [...new Set(postsData.map((p) => p.author_id))]
        : [];
      const allProfileIds = [...new Set([...reporterIds, ...authorIds])];

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", allProfileIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
      const postsMap = new Map(postsData?.map((p) => [p.id, p]) || []);

      let enrichedReports: Report[] = filteredReports.map((report) => {
        const post = postsMap.get(report.post_id);
        const author = post ? profilesMap.get(post.author_id) : null;
        const reporter = profilesMap.get(report.reporter_id);

        return {
          ...report,
          post: {
            id: post?.id || "",
            title: post?.title || null,
            content: post?.content || "",
            city: post?.city || null,
            state: post?.state || null,
            images: post?.images || null,
            deleted_at: post?.deleted_at || null,
            author: {
              id: author?.id || "",
              username: author?.username || "Desconhecido",
              full_name: author?.full_name || "Usuário Desconhecido",
              avatar_url: author?.avatar_url || null,
            },
          },
          reporter: {
            id: reporter?.id || "",
            username: reporter?.username || "Desconhecido",
            full_name: reporter?.full_name || "Usuário Desconhecido",
            avatar_url: reporter?.avatar_url || null,
          },
        };
      });

      if (statusFilter === "removed") {
        enrichedReports = enrichedReports.filter(
          (report) => report.post.deleted_at !== null,
        );
      }

      return enrichedReports;
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({
      reportId,
      action,
    }: {
      reportId: string;
      action: "resolved" | "dismissed";
    }) => {
      const { error } = await supabase
        .from("post_reports")
        .update({ status: action })
        .eq("id", reportId);

      if (error) throw error;
      return { reportId, action };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["community-reports"] });

      toast({
        title:
          data.action === "resolved"
            ? "Denúncia resolvida"
            : "Denúncia descartada",
        description:
          data.action === "resolved"
            ? "A denúncia foi resolvida e o post será removido."
            : "A denúncia foi descartada e o post permanece ativo.",
      });
    },
    onError: (error) => {
      console.error("Error updating report:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar denúncia",
        description: "Não foi possível atualizar a denúncia. Tente novamente.",
      });
    },
  });

  return {
    reports: reportsQuery.data ?? [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    updateReport: updateReportMutation.mutate,
    isUpdating: updateReportMutation.isPending,
    updateVariables: updateReportMutation.variables,
  };
}

export type { Report };
