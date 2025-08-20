"use client";

import { useState, useEffect, useRef } from "react";
import { WhatsAppProductCard } from "./whatsapp-product-card";
import { ProductFilters } from "./product-filters";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ApiListResponse } from "@/types/IWhatsappProductCatalog";
import { IProduct } from "@/types/product";

type ApiCategories = { categories: { name: string; count: number }[] };

// ------- debounce simple (espera antes de disparar fetch) -------
function useDebounce<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// map doc del server → IProduct (tu schema)
function mapServerProduct(doc: any): IProduct {
  return {
    _id: String(doc._id ?? doc.id ?? ""),
    title: doc.title ?? doc.name ?? "",
    description: doc.description ?? "",
    sales_price:
      doc.sales_price !== undefined && doc.sales_price !== null
        ? Number(doc.sales_price)
        : Number(doc.price ?? 0),
    price:
      doc.price !== undefined && doc.price !== null ? Number(doc.price) : null,
    category: doc.category ?? "",
    subcategory: doc.subcategory ?? "",
    is_deleted: Boolean(doc.is_deleted ?? false),
    image_urls: Array.isArray(doc.image_urls) ? doc.image_urls : undefined,
    image:
      doc.image ??
      (Array.isArray(doc.image_urls) && doc.image_urls.length > 0
        ? doc.image_urls[0]
        : "") ??
      "",
    stock: Number(doc.stock ?? 0),
  };
}

export function WhatsAppProductCatalog() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // categorías globales
  const [categories, setCategories] = useState<string[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 450);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const abortRef = useRef<AbortController | null>(null);

  // cargar categorías + primera página
  useEffect(() => {
    (async () => {
      try {
        setCatLoading(true);
        const res = await fetch("/api/categories");
        const data: ApiCategories = await res.json();
        const names = data.categories?.map((c) => c.name) ?? [];
        setCategories(["all", ...names]);
      } catch {
        setCategories(["all"]);
      } finally {
        setCatLoading(false);
      }
    })();

    fetchPage(1, true, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cuando cambian filtros/búsqueda (debounced), reset y recarga
  useEffect(() => {
    setProducts([]);
    setPage(1);
    fetchPage(1, true, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, debouncedSearch]);

  async function fetchPage(nextPage: number, replace = false, qOverride?: string) {
    // cancela petición previa
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    const q = qOverride ?? debouncedSearch;
    if (q) params.set("q", q);
    if (selectedCategory && selectedCategory !== "all")
      params.set("category", selectedCategory);

    try {
      if (replace || nextPage === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/products?${params.toString()}`, {
        signal: ctrl.signal,
      });
      const raw = await res.json();

      if (Array.isArray(raw)) {
        // compat: si el endpoint aún devuelve array plano
        const mapped = raw.map(mapServerProduct);
        if (replace) {
          setProducts(mapped);
        } else {
          setProducts((prev) => {
            const seen = new Set(prev.map((p) => p._id));
            const toAdd = mapped.filter((p) => !seen.has(p._id));
            return [...prev, ...toAdd];
          });
        }
        setTotalPages(1);
        setPage(1);
      } else {
        const data = raw as ApiListResponse;
        const mapped = (data.items ?? []).map(mapServerProduct);

        if (replace) {
          setProducts(mapped);
        } else {
          setProducts((prev) => {
            const seen = new Set(prev.map((p) => p._id));
            const toAdd = mapped.filter((p) => !seen.has(p._id));
            return [...prev, ...toAdd];
          });
        }

        setTotalPages(data.totalPages || 1);
        setPage(nextPage);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError")
        console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="whatsapp-bg min-h-screen pt-24">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Cargando productos...</span>
        </div>
      </div>
    );
  }

  const hasMore = page < totalPages;

  return (
    <div className="whatsapp-bg min-h-screen pt-24">
      {/* Indicador de fecha estilo WhatsApp */}
      <div className="text-center py-4">
        <div className="inline-block bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-sm">
          <span className="text-xs text-gray-600">Hoy</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 mb-4">
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          loading={catLoading}
        />
      </div>

      {/* Productos */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white bg-opacity-90 rounded-lg p-6 mx-4 shadow-sm">
            <p className="text-gray-600 text-lg mb-4">No se encontraron productos</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
              }}
              className="bg-white"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center space-y-4 pb-4">
            {products.map((p) => (
              <WhatsAppProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Cargar más */}
          <div className="flex justify-center pb-20">
            {hasMore ? (
              <Button
                onClick={() => fetchPage(page + 1)}
                disabled={loadingMore}
                className="bg-white text-emerald-700 border border-emerald-200"
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cargando…
                  </>
                ) : (
                  "Cargar más"
                )}
              </Button>
            ) : (
              <span className="text-xs text-gray-500 bg-white bg-opacity-80 px-3 py-1 rounded-full">
                No hay más productos
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
