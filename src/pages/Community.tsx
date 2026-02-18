import { useState } from "react";
import {
  useCommunityReports,
  type Report,
} from "@/hooks/use-community-reports";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Loader2, Check, X, Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam ou conteúdo enganoso",
  hate_speech: "Discurso de ódio ou assédio",
  inappropriate: "Conteúdo impróprio",
  copyright: "Violação de direitos autorais",
  other: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  resolved: "Resolvida",
  dismissed: "Descartada",
  reviewed: "Revisada",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  resolved: "default",
  dismissed: "secondary",
  reviewed: "outline",
};

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { reports, isLoading, updateReport, isUpdating, updateVariables } =
    useCommunityReports({
      statusFilter,
      reasonFilter,
      searchTerm: debouncedSearchTerm,
    });

  const filteredReports = reports;

  const handleAction = (reportId: string, action: "resolved" | "dismissed") => {
    updateReport({ reportId, action });
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => (prev ? { ...prev, status: action } : null));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comunidade</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as denúncias de posts da comunidade
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Denúncias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por autor, denunciante ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="resolved">Resolvidas</SelectItem>
                  <SelectItem value="dismissed">Descartadas</SelectItem>
                  <SelectItem value="removed">
                    Post removido pelo usuário
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os motivos</SelectItem>
                  <SelectItem value="spam">
                    Spam ou conteúdo enganoso
                  </SelectItem>
                  <SelectItem value="hate_speech">
                    Discurso de ódio ou assédio
                  </SelectItem>
                  <SelectItem value="inappropriate">
                    Conteúdo impróprio
                  </SelectItem>
                  <SelectItem value="copyright">
                    Violação de direitos autorais
                  </SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                Nenhuma denúncia encontrada
              </h3>
              <p className="text-muted-foreground">
                {reports.length === 0
                  ? "Ainda não há denúncias registradas."
                  : "Tente ajustar os filtros de busca."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Denunciante</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openReportDetails(report)}
                    >
                      <TableCell className="max-w-[200px]">
                        <div className="truncate font-medium">
                          {report.post.title ||
                            report.post.content.slice(0, 50) + "..."}
                        </div>
                        {report.post.city && (
                          <div className="text-xs text-muted-foreground">
                            {report.post.city}
                            {report.post.state && `, ${report.post.state}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={report.post.author.avatar_url || undefined}
                            />
                            <AvatarFallback>
                              {getInitials(report.post.author.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden sm:block">
                            <div className="text-sm font-medium">
                              {report.post.author.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{report.post.author.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={report.reporter.avatar_url || undefined}
                            />
                            <AvatarFallback>
                              {getInitials(report.reporter.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden sm:block">
                            <div className="text-sm font-medium">
                              {report.reporter.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{report.reporter.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {REASON_LABELS[report.reason] || report.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.post.deleted_at ? (
                          <Badge
                            variant="destructive"
                            className="whitespace-nowrap"
                          >
                            Post removido pelo usuário
                          </Badge>
                        ) : (
                          <Badge variant={STATUS_VARIANTS[report.status]}>
                            {STATUS_LABELS[report.status] || report.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(report.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openReportDetails(report)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          {report.status === "pending" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() =>
                                      handleAction(report.id, "resolved")
                                    }
                                    disabled={isUpdating}
                                  >
                                    {isUpdating &&
                                    updateVariables?.reportId === report.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Aprovar denúncia
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                      handleAction(report.id, "dismissed")
                                    }
                                    disabled={isUpdating}
                                  >
                                    {isUpdating &&
                                    updateVariables?.reportId === report.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Descartar denúncia
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
            <DialogDescription>
              Visualize os detalhes completos da denúncia
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Post Content */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Conteúdo do Post
                </h4>
                {selectedReport.post.images &&
                  selectedReport.post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.post.images
                        .slice(0, 4)
                        .map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Imagem ${index + 1}`}
                            className="rounded-lg object-cover w-full h-32"
                          />
                        ))}
                    </div>
                  )}
                {selectedReport.post.title && (
                  <h3 className="font-semibold">{selectedReport.post.title}</h3>
                )}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedReport.post.content}
                </p>
                {selectedReport.post.city && (
                  <p className="text-xs text-muted-foreground">
                    📍 {selectedReport.post.city}
                    {selectedReport.post.state &&
                      `, ${selectedReport.post.state}`}
                  </p>
                )}
              </div>

              {/* Author Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Autor do Post
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedReport.post.author.avatar_url || undefined}
                    />
                    <AvatarFallback>
                      {getInitials(selectedReport.post.author.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedReport.post.author.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{selectedReport.post.author.username}
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Informações da Denúncia
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Motivo</p>
                    <Badge variant="outline" className="mt-1">
                      {REASON_LABELS[selectedReport.reason] ||
                        selectedReport.reason}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    {selectedReport.post.deleted_at ? (
                      <Badge
                        variant="destructive"
                        className="whitespace-nowrap"
                      >
                        Post removido pelo usuário
                      </Badge>
                    ) : (
                      <Badge variant={STATUS_VARIANTS[selectedReport.status]}>
                        {STATUS_LABELS[selectedReport.status] ||
                          selectedReport.status}
                      </Badge>
                    )}
                  </div>
                </div>
                {selectedReport.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Descrição
                    </p>
                    <p className="text-sm bg-muted p-3 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Reporter Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Denunciante
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedReport.reporter.avatar_url || undefined}
                    />
                    <AvatarFallback>
                      {getInitials(selectedReport.reporter.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedReport.reporter.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{selectedReport.reporter.username}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Denunciado em{" "}
                  {format(
                    new Date(selectedReport.created_at),
                    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    },
                  )}
                </p>
              </div>

              {/* Actions */}
              {selectedReport.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    variant="default"
                    onClick={() => handleAction(selectedReport.id, "resolved")}
                    disabled={isUpdating}
                  >
                    {isUpdating &&
                    updateVariables?.reportId === selectedReport.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Aprovar Denúncia
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleAction(selectedReport.id, "dismissed")}
                    disabled={isUpdating}
                  >
                    {isUpdating &&
                    updateVariables?.reportId === selectedReport.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Descartar Denúncia
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
