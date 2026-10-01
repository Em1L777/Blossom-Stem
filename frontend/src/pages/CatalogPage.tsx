// frontend/src/pages/CatalogPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import type { Product, Category } from '../types';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategory);
  const [showAddonsOnly, setShowAddonsOnly] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          axiosClient.get('/products'),
          axiosClient.get('/categories'),
        ]);

        if (productsRes.data.success) {
          setProducts(productsRes.data.data || []);
        }

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data || []);
        }
      } catch (error: any) {
        console.error('Failed to load catalog data:', error);
        const message =
          error.response?.data?.error?.message ||
          error.message ||
          'Could not connect to backend server. Make sure backend is running.';
        setFetchError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    setSelectedCategoryId(categoryFromUrl);
  }, [searchParams]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (showAddonsOnly && !product.isAddon) {
        return false;
      }

      if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesComposition = product.composition?.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesComposition && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, selectedCategoryId, showAddonsOnly]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="border-b border-[#e2e2e2] pb-6 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
          Atelier Boutique • Seasonal Catalog & Stems
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1c1c] font-normal leading-tight">
          Curated Floral Catalog
        </h1>
        <p className="text-xs text-[#404944] max-w-2xl leading-relaxed">
          Handcrafted seasonal stems and bespoke botanical compositions sourced directly from local Catalan growers in Maresme and Girona. Arranged freshly each dawn in our El Born atelier.
        </p>
      </div>

      {/* Top Filter & Search Controls */}
      <div className="bg-white border border-[#e7e5e4] p-4 rounded-lg space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-stone-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by stem name, floral composition, or arrangement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] placeholder:text-[#707974] focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1a1c1c] bg-[#fafaf9] px-3.5 h-10 rounded border border-[#d6d3d1] select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={showAddonsOnly}
              onChange={(e) => setShowAddonsOnly(e.target.checked)}
              className="w-4 h-4 accent-[#064e3b] rounded cursor-pointer"
            />
            <span>Show Greeting Cards & Gifts Only</span>
          </label>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-[#f5f5f4]">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded uppercase tracking-wider whitespace-nowrap transition ${
              selectedCategoryId === null
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'bg-[#fafaf9] border border-[#e2e2e2] text-[#404944] hover:text-[#1a1c1c] hover:border-[#064e3b]'
            }`}
          >
            All Categories ({products.filter((p) => (showAddonsOnly ? p.isAddon : true)).length})
          </button>
          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.categoryId === cat.id && (showAddonsOnly ? p.isAddon : true)
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded uppercase tracking-wider whitespace-nowrap transition ${
                  selectedCategoryId === cat.id
                    ? 'bg-[#064e3b] text-white shadow-sm'
                    : 'bg-[#fafaf9] border border-[#e2e2e2] text-[#404944] hover:text-[#1a1c1c] hover:border-[#064e3b]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#404944]">
          <span>
            Showing <strong className="text-[#1a1c1c]">{filteredProducts.length}</strong> items
          </span>
          {(searchQuery || selectedCategoryId || showAddonsOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategorySelect(null);
                setShowAddonsOnly(false);
              }}
              className="text-[#064e3b] font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {fetchError && (
          <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded-md text-xs text-[#9f1239] space-y-1">
            <p className="font-semibold">⚠️ Failed to load catalog from server</p>
            <p>{fetchError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 bg-[#e8e8e7] rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 && !fetchError ? (
          <div className="p-12 text-center bg-white border border-[#e7e5e4] rounded-lg space-y-3">
            <span className="text-3xl block">💐</span>
            <h3 className="font-serif text-lg text-[#1a1c1c] font-normal">No seasonal items found</h3>
            <p className="text-xs text-[#404944] max-w-sm mx-auto leading-relaxed">
              We couldn't find any items matching your current filters or search query. Try clearing your search or switching categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategorySelect(null);
                setShowAddonsOnly(false);
              }}
              className="px-4 py-2 bg-[#064e3b] text-white text-xs font-semibold uppercase tracking-wider rounded transition shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-[#e7e5e4] rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  {/* Кликабельное фото */}
                  <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-[#f5f5f4] overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#064e3b] px-2 py-0.5 rounded border border-[#e2e2e2]">
                      {product.category?.name || (product.isAddon ? 'Gift Card' : 'Arrangement')}
                    </span>
                    {product.stockQuantity > 0 ? (
                      <span className="absolute top-2.5 right-2.5 bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold px-2 py-0.5 rounded border border-[#bbf7d0]">
                        In Stock ({product.stockQuantity})
                      </span>
                    ) : (
                      <span className="absolute top-2.5 right-2.5 bg-[#fff1f2] text-[#9f1239] text-[10px] font-bold px-2 py-0.5 rounded border border-[#fecdd3]">
                        Out of Stock
                      </span>
                    )}
                  </Link>

                  <div className="p-4 space-y-1.5">
                    {/* Кликабельный заголовок */}
                    <Link
                      to={`/product/${product.slug}`}
                      className="font-serif text-lg text-[#1a1c1c] font-medium hover:text-[#064e3b] transition block line-clamp-1"
                    >
                      {product.title}
                    </Link>
                    <p className="text-[11px] text-[#404944] line-clamp-2 leading-relaxed">
                      {product.composition || product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-[#f5f5f4] mt-2 gap-2">
                  <span className="font-semibold text-sm text-[#1a1c1c]">
                    {formatCurrency(product.price)}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Кнопка подробнее */}
                    <Link
                      to={`/product/${product.slug}`}
                      className="h-8 px-2.5 bg-[#fafaf9] border border-[#d6d3d1] hover:border-[#064e3b] text-[#1a1c1c] text-[10px] font-semibold uppercase tracking-wider rounded transition flex items-center justify-center"
                    >
                      Details
                    </Link>

                    {/* Кнопка добавления в корзину */}
                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stockQuantity === 0}
                      className="h-8 px-3 bg-[#064e3b] hover:bg-[#022c22] text-white text-[10px] font-semibold uppercase tracking-wider rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {product.stockQuantity > 0 ? '+ Cart' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Guarantees Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#e2e2e2] text-xs text-[#404944]">
        <div className="p-4 bg-white border border-[#e7e5e4] rounded flex items-center gap-3">
          <span className="text-xl">🌿</span>
          <div>
            <span className="font-bold text-[#1a1c1c] block">Maresme Provenance</span>
            <span>Cut directly from verified Mediterranean growers within 40km of Barcelona.</span>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#e7e5e4] rounded flex items-center gap-3">
          <span className="text-xl">🚚</span>
          <div>
            <span className="font-bold text-[#1a1c1c] block">Climate-Controlled Courier</span>
            <span>Same-day delivery in Barcelona with hydration reservoir packaging.</span>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#e7e5e4] rounded flex items-center gap-3">
          <span className="text-xl">💌</span>
          <div>
            <span className="font-bold text-[#1a1c1c] block">Hand-Inscribed Dedications</span>
            <span>Complimentary custom card on 350gsm textured cotton cardstock.</span>
          </div>
        </div>
      </div>
    </div>
  );
};