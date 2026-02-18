import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Upload,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  UserCheck,
  XCircle,
  Search,
  Loader2,
  FileJson,
  AlertCircle,
} from "lucide-react";

interface Place {
  place_id: string;
  name: string;
  address?: string;
}

interface PlaceWithSimilarity extends Place {
  similarity: number;
}

interface ImportItem {
  id: string;
  import_batch_id: string;
  original_name: string;
  matched_place_id: string | null;
  matched_place_name: string | null;
  status: "auto_matched" | "pending" | "manual_matched" | "skipped";
  match_confidence: number | null;
  suggested_places: Place[] | null;
  created_at: string;
  // New feed fields
  external_id: string | null;
  title: string | null;
  description: string | null;
  offer_link: string | null;
  image_link: string | null;
  original_price: number | null;
  sale_price: number | null;
  currency: string | null;
  availability: string | null;
  category_id: number | null;
}

// Feed item interface for the new JSON structure
interface FeedItem {
  "g:id": number | string;
  "g:title": string;
  "g:description": string;
  "g:link": string;
  "g:image_link": string;
  "g:brand": string;
  "g:condition"?: string;
  "g:availability": string;
  "g:price": string;
  "g:sale_price": string;
  "g:google_product_category"?: number;
}

interface FeedStructure {
  feed: {
    rss: {
      channel: {
        title?: string;
        link?: string;
        item: FeedItem[];
      };
    };
  };
}

interface ProcessedFeedItem {
  nome: string;
  external_id: string;
  title: string;
  description: string;
  offer_link: string;
  image_link: string;
  original_price: number | null;
  sale_price: number | null;
  currency: string;
  availability: string;
  category_id: number | null;
}

interface ImportBatch {
  id: string;
  source_type: "file" | "url";
  source_name: string | null;
  total_items: number;
  auto_matched_count: number;
  manual_matched_count: number;
  pending_count: number;
  status: "processing" | "ready" | "completed" | "cancelled";
  created_at: string;
}

const STATUS_CONFIG = {
  auto_matched: {
    label: "Associado automaticamente",
    variant: "default" as const,
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  pending: {
    label: "Pendente",
    variant: "outline" as const,
    icon: Clock,
    className: "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-500",
  },
  manual_matched: {
    label: "Manual",
    variant: "secondary" as const,
    icon: UserCheck,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  skipped: {
    label: "Ignorado",
    variant: "destructive" as const,
    icon: XCircle,
    className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  },
};

export default function Coupons() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Import states
  const [urlInput, setUrlInput] = useState("https://www.lacadordeofertas.com.br/api/ofertas/feed.json");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<ImportBatch | null>(null);
  const [items, setItems] = useState<ImportItem[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Modal states
  const [selectedItem, setSelectedItem] = useState<ImportItem | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [placeSearchTerm, setPlaceSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceWithSimilarity[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add more coupons dialog
  const [showAddMoreDialog, setShowAddMoreDialog] = useState(false);
  const [addMoreUrlInput, setAddMoreUrlInput] = useState("");

  // All places for matching
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);

  // Load all items from coupon_import_items
  const loadAllItems = useCallback(async () => {
    const { data: itemsData } = await supabase
      .from("coupon_import_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (itemsData) {
      const transformedItems: ImportItem[] = itemsData.map((item) => ({
        ...item,
        status: item.status as ImportItem["status"],
        suggested_places: item.suggested_places as unknown as Place[] | null,
      }));
      setItems(transformedItems);
    }
  }, []);

  // Load existing places and items on mount
  useEffect(() => {
    loadPlaces();
    loadAllItems();
  }, [loadAllItems]);

  const loadPlaces = async () => {
    const { data } = await supabase.from("favorite_locations").select("place_id, name, address");

    if (data) {
      setAllPlaces(data);
    }
  };

  const loadBatchItems = useCallback(async (batchId: string) => {
    const { data: batchData } = await supabase.from("coupon_import_batches").select("*").eq("id", batchId).single();

    if (batchData) {
      setCurrentBatch(batchData as ImportBatch);
    }

    const { data: itemsData } = await supabase
      .from("coupon_import_items")
      .select("*")
      .eq("import_batch_id", batchId)
      .order("created_at", { ascending: true });

    if (itemsData) {
      // Transform Json to Place[] for suggested_places
      const transformedItems: ImportItem[] = itemsData.map((item) => ({
        ...item,
        status: item.status as ImportItem["status"],
        suggested_places: item.suggested_places as unknown as Place[] | null,
      }));
      setItems(transformedItems);
    }
  }, []);

  // Validate the new feed structure
  const validateFeedStructure = (data: unknown): data is FeedStructure => {
    if (typeof data !== "object" || data === null) return false;

    const feed = (data as FeedStructure).feed;
    if (!feed?.rss?.channel?.item) return false;

    const items = feed.rss.channel.item;
    if (!Array.isArray(items)) return false;

    // Validate that each item has g:brand (location name)
    return items.every((item) => typeof item === "object" && item !== null && "g:brand" in item);
  };

  // Helper to parse price string like "67.90 BRL" into number
  const parsePrice = (priceStr: string): number | null => {
    if (!priceStr) return null;
    const match = priceStr.match(/[\d,.]+/);
    if (!match) return null;
    return parseFloat(match[0].replace(",", "."));
  };

  // Helper to extract currency from price string
  const extractCurrency = (priceStr: string): string => {
    if (!priceStr) return "BRL";
    const match = priceStr.match(/[A-Z]{3}/);
    return match ? match[0] : "BRL";
  };

  // Extract and transform items from the feed structure
  const extractItemsFromFeed = (data: FeedStructure): ProcessedFeedItem[] => {
    const items = data.feed.rss.channel.item;

    return items.map((item) => ({
      nome: item["g:brand"],
      external_id: String(item["g:id"]),
      title: item["g:title"],
      description: item["g:description"],
      offer_link: item["g:link"],
      image_link: item["g:image_link"],
      original_price: parsePrice(item["g:price"]),
      sale_price: parsePrice(item["g:sale_price"]),
      currency: extractCurrency(item["g:price"]),
      availability: item["g:availability"],
      category_id: item["g:google_product_category"] || null,
    }));
  };

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Calculate similarity between two strings (0-100%) using Levenshtein distance
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);

    if (s1 === s2) return 100;
    if (!s1.length || !s2.length) return 0;

    // Levenshtein distance algorithm
    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost, // substitution
        );
      }
    }

    const distance = matrix[s1.length][s2.length];
    const maxLength = Math.max(s1.length, s2.length);
    return Math.round((1 - distance / maxLength) * 100);
  };

  // Find places with similar names, sorted by similarity
  const findSimilarPlaces = (name: string, places: Place[]): PlaceWithSimilarity[] => {
    return places
      .map((place) => ({
        ...place,
        similarity: calculateSimilarity(name, place.name),
      }))
      .filter((item) => item.similarity >= 30) // Minimum 30% similarity
      .sort((a, b) => b.similarity - a.similarity) // Highest similarity first
      .slice(0, 10); // Top 10 results
  };

  const processImportData = async (data: ProcessedFeedItem[], sourceType: "file" | "url", sourceName: string) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // Get all external_ids from the incoming data
      const externalIds = data.map((item) => item.external_id).filter(Boolean);

      // Fetch existing items with these external_ids to preserve their matched data
      const { data: existingItems } = await supabase
        .from("coupon_import_items")
        .select("external_id, matched_place_id, matched_place_name, status")
        .in("external_id", externalIds);

      // Create a map for quick lookup of existing items
      const existingMap = new Map((existingItems || []).map((item) => [item.external_id, item]));

      // Create import batch
      const { data: batch, error: batchError } = await supabase
        .from("coupon_import_batches")
        .insert({
          source_type: sourceType,
          source_name: sourceName,
          total_items: data.length,
          created_by: user.id,
        })
        .select()
        .single();

      if (batchError || !batch) {
        throw new Error("Erro ao criar lote de importação");
      }

      // Process each item and try automatic matching
      const processedItems = data.map((item) => {
        const normalizedName = normalizeText(item.nome);

        // Check if item already exists and has a match
        const existing = existingMap.get(item.external_id);
        const hasExistingMatch =
          existing && (existing.status === "auto_matched" || existing.status === "manual_matched");

        // Try exact match first (only if not already matched)
        const exactMatch = hasExistingMatch ? null : allPlaces.find((p) => normalizeText(p.name) === normalizedName);

        // Find suggestions (partial matches)
        const suggestions = allPlaces
          .filter((p) => {
            const pName = normalizeText(p.name);
            return (
              pName.includes(normalizedName) ||
              normalizedName.includes(pName) ||
              pName.split(" ").some((word) => normalizedName.includes(word))
            );
          })
          .slice(0, 5);

        // Convert suggestions to JSON-compatible format
        const suggestionsJson =
          suggestions.length > 0
            ? suggestions.map((s) => ({ place_id: s.place_id, name: s.name, address: s.address || null }))
            : null;

        // Preserve existing match data if already matched
        const matchedPlaceId = hasExistingMatch ? existing.matched_place_id : exactMatch?.place_id || null;
        const matchedPlaceName = hasExistingMatch ? existing.matched_place_name : exactMatch?.name || null;
        const status = hasExistingMatch ? existing.status : exactMatch ? "auto_matched" : "pending";
        const matchConfidence = hasExistingMatch ? 100 : exactMatch ? 100 : null;

        return {
          import_batch_id: batch.id,
          original_name: item.nome,
          matched_place_id: matchedPlaceId,
          matched_place_name: matchedPlaceName,
          status: status,
          match_confidence: matchConfidence,
          suggested_places: suggestionsJson,
          created_by: user.id,
          // New feed fields
          external_id: item.external_id,
          title: item.title,
          description: item.description,
          offer_link: item.offer_link,
          image_link: item.image_link,
          original_price: item.original_price,
          sale_price: item.sale_price,
          currency: item.currency,
          availability: item.availability,
          category_id: item.category_id,
        };
      });

      // Use upsert to insert new items and update existing ones based on external_id
      const { error: itemsError } = await supabase.from("coupon_import_items").upsert(processedItems, {
        onConflict: "external_id",
        ignoreDuplicates: false,
      });

      if (itemsError) {
        throw new Error("Erro ao inserir/atualizar itens");
      }

      // Count results
      const newItems = processedItems.filter((i) => !existingMap.has(i.external_id));
      const updatedItems = processedItems.filter((i) => existingMap.has(i.external_id));
      const autoMatched = processedItems.filter((i) => i.status === "auto_matched").length;
      const pending = processedItems.filter((i) => i.status === "pending").length;

      await supabase
        .from("coupon_import_batches")
        .update({
          auto_matched_count: autoMatched,
          pending_count: pending,
          status: "ready",
        })
        .eq("id", batch.id);

      // Reload all items
      await loadAllItems();

      toast({
        title: "Importação concluída!",
        description: `${newItems.length} novos itens, ${updatedItems.length} atualizados. ${autoMatched} associados, ${pending} pendentes.`,
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos .json são permitidos",
        variant: "destructive",
      });
      return;
    }

    try {
      const content = await file.text();
      const data = JSON.parse(content);

      if (!validateFeedStructure(data)) {
        toast({
          title: "Estrutura inválida",
          description: "O JSON deve seguir o formato feed.rss.channel.item com g:brand",
          variant: "destructive",
        });
        return;
      }

      const items = extractItemsFromFeed(data);
      await processImportData(items, "file", file.name);
    } catch {
      toast({
        title: "Erro ao ler arquivo",
        description: "O arquivo não é um JSON válido",
        variant: "destructive",
      });
    }

    // Reset input
    event.target.value = "";
  };

  const handleUrlImport = async () => {
    if (!urlInput.startsWith("http")) {
      toast({
        title: "URL inválida",
        description: "A URL deve começar com http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error("Falha ao acessar a URL");
      }

      const data = await response.json();

      if (!validateFeedStructure(data)) {
        toast({
          title: "Estrutura inválida",
          description: "O JSON deve seguir o formato feed.rss.channel.item com g:brand",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const items = extractItemsFromFeed(data);
      await processImportData(items, "url", urlInput);
      setUrlInput("");
    } catch {
      toast({
        title: "Erro ao importar",
        description: "Não foi possível acessar ou processar a URL",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Update batch counters helper
  const updateBatchCounters = async (batchId: string) => {
    const { data: batchItems } = await supabase
      .from("coupon_import_items")
      .select("status")
      .eq("import_batch_id", batchId);

    if (!batchItems) return;

    const counts = {
      total_items: batchItems.length,
      auto_matched_count: batchItems.filter((i) => i.status === "auto_matched").length,
      manual_matched_count: batchItems.filter((i) => i.status === "manual_matched").length,
      pending_count: batchItems.filter((i) => i.status === "pending").length,
    };

    await supabase.from("coupon_import_batches").update(counts).eq("id", batchId);

    setCurrentBatch((prev) => (prev ? { ...prev, ...counts } : null));
  };

  // Process adding more coupons to existing batch
  const processAddMoreCoupons = async (data: ProcessedFeedItem[], sourceName: string) => {
    if (!user || !currentBatch) return;

    setIsProcessing(true);

    try {
      // Fetch existing items in current batch
      const { data: existingItems } = await supabase
        .from("coupon_import_items")
        .select("id, original_name, external_id, matched_place_id, matched_place_name, status")
        .eq("import_batch_id", currentBatch.id);

      // Create maps for duplicate detection
      const byExternalId = new Map<string, (typeof existingItems)[0]>();
      const byName = new Map<string, (typeof existingItems)[0]>();

      for (const item of existingItems || []) {
        if (item.external_id) {
          byExternalId.set(item.external_id, item);
        }
        byName.set(normalizeText(item.original_name), item);
      }

      const itemsToInsert: ProcessedFeedItem[] = [];
      const itemsToUpdate: { id: string; data: Record<string, unknown> }[] = [];
      let updatedCount = 0;
      let newCount = 0;

      for (const item of data) {
        // Check for existing item by external_id first, then by name
        let existing = item.external_id ? byExternalId.get(item.external_id) : undefined;
        if (!existing) {
          existing = byName.get(normalizeText(item.nome));
        }

        if (existing) {
          // UPDATE: Update data fields, but KEEP existing link if manually or auto matched
          itemsToUpdate.push({
            id: existing.id,
            data: {
              external_id: item.external_id,
              title: item.title,
              description: item.description,
              offer_link: item.offer_link,
              image_link: item.image_link,
              original_price: item.original_price,
              sale_price: item.sale_price,
              currency: item.currency,
              availability: item.availability,
              category_id: item.category_id,
              updated_at: new Date().toISOString(),
              // NOT updating: matched_place_id, matched_place_name, status
            },
          });
          updatedCount++;
        } else {
          // INSERT: New item
          itemsToInsert.push(item);
          newCount++;
        }
      }

      // Execute updates
      for (const update of itemsToUpdate) {
        await supabase.from("coupon_import_items").update(update.data).eq("id", update.id);
      }

      // Execute inserts with automatic matching
      if (itemsToInsert.length > 0) {
        const newItems = itemsToInsert.map((item) => {
          const normalizedName = normalizeText(item.nome);
          const exactMatch = allPlaces.find((p) => normalizeText(p.name) === normalizedName);
          const suggestions = findSimilarPlaces(item.nome, allPlaces);

          return {
            import_batch_id: currentBatch.id,
            original_name: item.nome,
            matched_place_id: exactMatch?.place_id || null,
            matched_place_name: exactMatch?.name || null,
            status: exactMatch ? "auto_matched" : "pending",
            match_confidence: exactMatch ? 100 : null,
            suggested_places:
              suggestions.length > 0
                ? suggestions.map((s) => ({ place_id: s.place_id, name: s.name, address: s.address || null }))
                : null,
            created_by: user.id,
            external_id: item.external_id,
            title: item.title,
            description: item.description,
            offer_link: item.offer_link,
            image_link: item.image_link,
            original_price: item.original_price,
            sale_price: item.sale_price,
            currency: item.currency,
            availability: item.availability,
            category_id: item.category_id,
          };
        });

        await supabase.from("coupon_import_items").insert(newItems);
      }

      // Update batch counters
      await updateBatchCounters(currentBatch.id);

      // Reload data
      await loadBatchItems(currentBatch.id);

      toast({
        title: "Cupons adicionados!",
        description: `${updatedCount} atualizados, ${newCount} novos itens adicionados.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar cupons",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowAddMoreDialog(false);
      setAddMoreUrlInput("");
    }
  };

  const handleAddMoreFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast({
        title: "Arquivo inválido",
        description: "Apenas arquivos .json são permitidos",
        variant: "destructive",
      });
      return;
    }

    try {
      const content = await file.text();
      const data = JSON.parse(content);

      if (!validateFeedStructure(data)) {
        toast({
          title: "Estrutura inválida",
          description: "O JSON deve seguir o formato feed.rss.channel.item com g:brand",
          variant: "destructive",
        });
        return;
      }

      const feedItems = extractItemsFromFeed(data);
      await processAddMoreCoupons(feedItems, file.name);
    } catch {
      toast({
        title: "Erro ao ler arquivo",
        description: "O arquivo não é um JSON válido",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  const handleAddMoreUrlImport = async () => {
    if (!addMoreUrlInput.startsWith("http")) {
      toast({
        title: "URL inválida",
        description: "A URL deve começar com http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(addMoreUrlInput);
      if (!response.ok) {
        throw new Error("Falha ao acessar a URL");
      }

      const data = await response.json();

      if (!validateFeedStructure(data)) {
        toast({
          title: "Estrutura inválida",
          description: "O JSON deve seguir o formato feed.rss.channel.item com g:brand",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const feedItems = extractItemsFromFeed(data);
      await processAddMoreCoupons(feedItems, addMoreUrlInput);
    } catch {
      toast({
        title: "Erro ao importar",
        description: "Não foi possível acessar ou processar a URL",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleOpenLinkModal = (item: ImportItem) => {
    setSelectedItem(item);
    setSelectedPlace("");
    setPlaceSearchTerm(item.original_name);
    setSearchResults([]);
    setIsLinkModalOpen(true);
  };

  const handleSearchPlaces = async () => {
    if (!placeSearchTerm.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-places", {
        body: { action: "search", query: placeSearchTerm },
      });

      if (error) throw error;

      // Mapear resposta da edge function para o formato esperado
      const places = (data?.places || []).map(
        (p: { id: string; displayName?: { text: string } | string; formattedAddress?: string }) => ({
          place_id: p.id,
          name: typeof p.displayName === "object" ? p.displayName?.text : p.displayName,
          address: p.formattedAddress,
          similarity: 100,
        }),
      );

      setSearchResults(places);
    } catch (err) {
      console.error("Erro ao buscar locais:", err);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar locais",
        variant: "destructive",
      });
      // Fallback para busca local
      const similarPlaces = findSimilarPlaces(placeSearchTerm, allPlaces);
      setSearchResults(similarPlaces);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualMatch = async () => {
    if (!selectedItem || !selectedPlace) return;

    const place = [...(selectedItem.suggested_places || []), ...searchResults, ...allPlaces].find(
      (p) => p.place_id === selectedPlace,
    );

    if (!place) return;

    try {
      // 1. Atualizar item de importação
      await supabase
        .from("coupon_import_items")
        .update({
          matched_place_id: place.place_id,
          matched_place_name: place.name,
          status: "manual_matched",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedItem.id);

      // 2. Inserir na tabela location_coupons
      const { error: couponError } = await supabase.from("location_coupons").insert({
        place_id: place.place_id,
        external_id: selectedItem.external_id,
        original_name: selectedItem.original_name,
        title: selectedItem.title || selectedItem.original_name,
        description: selectedItem.description,
        offer_link: selectedItem.offer_link,
        image_link: selectedItem.image_link,
        original_price: selectedItem.original_price,
        sale_price: selectedItem.sale_price,
        currency: selectedItem.currency || "BRL",
        availability: selectedItem.availability,
        category_id: selectedItem.category_id,
        import_batch_id: selectedItem.import_batch_id,
        is_active: true,
      });

      if (couponError) {
        console.error("Erro ao inserir cupom:", couponError);
        throw couponError;
      }

      // 3. Update batch counters
      if (currentBatch) {
        const newPendingCount = currentBatch.pending_count - 1;
        const updateData: Record<string, unknown> = {
          manual_matched_count: currentBatch.manual_matched_count + 1,
          pending_count: newPendingCount,
        };

        // Auto-complete batch when no more pending items
        if (newPendingCount === 0) {
          updateData.status = "completed";
        }

        await supabase.from("coupon_import_batches").update(updateData).eq("id", currentBatch.id);

        if (currentBatch) {
          await loadBatchItems(currentBatch.id);
        }
      }

      // Reload all items
      await loadAllItems();

      toast({
        title: "Cupom vinculado!",
        description: `Salvo e vinculado a "${place.name}"`,
      });

      setIsLinkModalOpen(false);
    } catch {
      toast({
        title: "Erro ao vincular",
        description: "Não foi possível salvar a vinculação",
        variant: "destructive",
      });
    }
  };

  const handleSkipItem = async (item: ImportItem) => {
    try {
      await supabase
        .from("coupon_import_items")
        .update({
          status: "skipped",
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (currentBatch) {
        await supabase
          .from("coupon_import_batches")
          .update({
            pending_count: currentBatch.pending_count - 1,
          })
          .eq("id", currentBatch.id);

        await loadBatchItems(currentBatch.id);
      }

      // Reload all items
      await loadAllItems();

      toast({
        title: "Item ignorado",
        description: `"${item.original_name}" foi marcado como ignorado`,
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível ignorar o item",
        variant: "destructive",
      });
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.matched_place_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Calculate stats from all items
  const stats = useMemo(
    () => ({
      total: items.length,
      auto_matched: items.filter((i) => i.status === "auto_matched").length,
      manual_matched: items.filter((i) => i.status === "manual_matched").length,
      pending: items.filter((i) => i.status === "pending").length,
      skipped: items.filter((i) => i.status === "skipped").length,
    }),
    [items],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Cupons</h1>
          <p className="text-muted-foreground">Importe e vincule locais com cupons disponíveis</p>
        </div>
        {currentBatch && (
          <Button onClick={() => setShowAddMoreDialog(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Cupons
          </Button>
        )}
      </div>

      {/* Import Section */}
      {!currentBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Importar Dados
            </CardTitle>
            <CardDescription>Forneça uma URL com os locais que possuem cupons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL Import */}
            <div className="space-y-2">
              <Label>Importar via URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://exemplo.com/dados.json"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isProcessing}
                />
                <Button onClick={handleUrlImport} disabled={!urlInput || isProcessing} size="icon">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary - Always visible */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de Itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.auto_matched}</div>
            <p className="text-xs text-muted-foreground">Automáticos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.manual_matched}</div>
            <p className="text-xs text-muted-foreground">Manuais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">{stats.skipped}</div>
            <p className="text-xs text-muted-foreground">Ignorados</p>
          </CardContent>
        </Card>
      </div>

      {stats.pending > 0 && (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Ainda existem {stats.pending} itens pendentes de vinculação</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="auto_matched">Automáticos</SelectItem>
            <SelectItem value="manual_matched">Manuais</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="skipped">Ignorados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Imagem</TableHead>
                <TableHead>Local (g:brand)</TableHead>
                <TableHead>Título da Oferta</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Local Vinculado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => {
                const statusConfig = STATUS_CONFIG[item.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image_link ? (
                        <img
                          src={item.image_link}
                          alt={item.title || item.original_name}
                          className="w-12 h-12 object-cover rounded"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) return;
                            const fallback = document.createElement('div');
                            fallback.className = 'w-12 h-12 bg-muted rounded flex items-center justify-center';
                            fallback.innerHTML = '<svg class="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                            target.parentElement?.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <FileJson className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.original_name}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={item.title || undefined}>
                        {item.title || <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.sale_price ? (
                        <div className="space-y-0.5">
                          {item.original_price && item.original_price !== item.sale_price && (
                            <span className="text-xs text-muted-foreground line-through block">
                              {item.currency} {item.original_price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm font-medium text-green-600">
                            {item.currency} {item.sale_price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{item.matched_place_name || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => handleOpenLinkModal(item)}>
                            Vincular
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSkipItem(item)}>
                            Ignorar
                          </Button>
                        </div>
                      )}
                      {(item.status === "auto_matched" || item.status === "manual_matched") && (
                        <Button size="sm" variant="ghost" onClick={() => handleOpenLinkModal(item)}>
                          Alterar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} de {filteredItems.length} itens
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* First page */}
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(1)}
                  isActive={currentPage === 1}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {/* Ellipsis at start */}
              {currentPage > 3 && <PaginationEllipsis />}

              {/* Pages around current */}
              {[currentPage - 1, currentPage, currentPage + 1]
                .filter((page) => page > 1 && page < totalPages)
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* Ellipsis at end */}
              {currentPage < totalPages - 2 && <PaginationEllipsis />}

              {/* Last page */}
              {totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(totalPages)}
                    isActive={currentPage === totalPages}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Link Modal */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Local</DialogTitle>
            <DialogDescription>
              Buscando locais similares a: <strong>{selectedItem?.original_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Manual Search - Now at top */}
            <div className="space-y-2">
              <Label>Buscar outro local</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por nome..."
                  value={placeSearchTerm}
                  onChange={(e) => setPlaceSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchPlaces()}
                />
                <Button size="icon" variant="outline" onClick={handleSearchPlaces} disabled={isSearching}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Similar Places - Below search */}
            <div className="space-y-2 border-t pt-4">
              <Label>Locais similares encontrados</Label>

              {searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto pr-2">
                  <RadioGroup value={selectedPlace} onValueChange={setSelectedPlace}>
                    {searchResults.map((place) => (
                      <div key={place.place_id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={place.place_id} id={`place-${place.place_id}`} />
                        <Label htmlFor={`place-${place.place_id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{place.name}</span>
                            <Badge
                              variant={
                                place.similarity >= 80 ? "default" : place.similarity >= 50 ? "secondary" : "outline"
                              }
                              className={place.similarity >= 80 ? "bg-green-100 text-green-800" : ""}
                            >
                              {place.similarity}%
                            </Badge>
                          </div>
                          {place.address && <span className="text-xs text-muted-foreground block">{place.address}</span>}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  {isSearching ? "Buscando..." : "Clique na lupa para buscar locais"}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleManualMatch} disabled={!selectedPlace}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add More Coupons Dialog */}
      <Dialog open={showAddMoreDialog} onOpenChange={setShowAddMoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Adicionar Mais Cupons
            </DialogTitle>
            <DialogDescription>
              Importe mais cupons para este lote. Itens duplicados serão atualizados automaticamente, mantendo as
              vinculações manuais existentes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload de Arquivo</Label>
              <Input
                type="file"
                accept=".json"
                onChange={handleAddMoreFileUpload}
                disabled={isProcessing}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* URL Import */}
            <div className="space-y-2">
              <Label>Importar via URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com/dados.json"
                  value={addMoreUrlInput}
                  onChange={(e) => setAddMoreUrlInput(e.target.value)}
                  disabled={isProcessing}
                />
                <Button onClick={handleAddMoreUrlImport} disabled={!addMoreUrlInput || isProcessing} size="icon">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">💡 Comportamento:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>
                  • Cupons <strong>novos</strong>: serão adicionados com matching automático
                </li>
                <li>
                  • Cupons <strong>existentes</strong>: dados atualizados, vinculação mantida
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMoreDialog(false)} disabled={isProcessing}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
