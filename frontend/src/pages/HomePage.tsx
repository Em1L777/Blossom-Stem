// frontend/src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import type { Product, Category } from '../types';

export const HomePage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          axiosClient.get('/products'),
          axiosClient.get('/categories'),
        ]);

        if (productsRes.data.success) {
          const products: Product[] = productsRes.data.data || [];
          setAllProducts(products);
          
          const mainBouquets = products.filter((p) => !p.isAddon);
          setDisplayedProducts(mainBouquets.length > 0 ? mainBouquets.slice(0, 4) : products.slice(0, 4));
        }

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch home page data:', error);
        const errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          'Could not connect to backend server. Make sure backend is running on http://localhost:5000.';
        setFetchError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);

    if (categoryId === null) {
      const mainBouquets = allProducts.filter((p) => !p.isAddon);
      setDisplayedProducts(mainBouquets.slice(0, 4));
    } else {
      const filtered = allProducts.filter((p) => p.categoryId === categoryId);
      setDisplayedProducts(filtered);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-lg overflow-hidden border border-[#e7e5e4] bg-[#fafaf9] grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        <div className="lg:col-span-8 p-8 lg:p-12 flex flex-col justify-between z-10 bg-gradient-to-r from-[#fafaf9] via-[#fafaf9]/95 to-transparent">
          <div className="space-y-4 max-w-xl">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] bg-[#064e3b]/10 text-[#064e3b] px-3 py-1 rounded">
              Artisanal Atelier • Barcelona
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1a1c1c] font-normal leading-tight">
              Artisanal Florals Handcrafted for Barcelona's Most Poetic Moments
            </h1>
            <p className="text-xs sm:text-sm text-[#404944] leading-relaxed">
              Fresh daily arrivals, temperature-controlled delivery across Barcelona, and complimentary personalized handwritten greeting cards with every order.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="h-11 px-6 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-[0.1em] rounded transition flex items-center justify-center gap-2 shadow-sm"
              >
                ➔ Explore Catalog
              </Link>
              <Link
                to="/register"
                className="h-11 px-6 bg-white border border-[#064e3b] text-[#064e3b] hover:bg-[#fdf2f4] text-xs font-semibold uppercase tracking-[0.1em] rounded transition flex items-center justify-center"
              >
                10% First Order Discount
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-[#e2e2e2] flex items-center gap-6 text-[11px] text-[#404944]">
            <div>
              <span className="font-bold text-[#1a1c1c] block">Same-Day Delivery</span>
              <span>Across Barcelona City</span>
            </div>
            <div className="h-4 w-px bg-[#e2e2e2]"></div>
            <div>
              <span className="font-bold text-[#1a1c1c] block">100% Fresh Stems</span>
              <span>Catalan Growers</span>
            </div>
          </div>
        </div>

        <div
          className="lg:col-span-4 hidden lg:block bg-cover bg-center min-h-[480px]"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=1000&auto=format&fit=crop")',
          }}
        ></div>
      </section>

      {/* Value Propositions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-[#e7e5e4] rounded-lg space-y-2">
          <span className="text-2xl">🚚</span>
          <h3 className="font-serif text-lg text-[#1a1c1c] font-medium">Same-Day Barcelona Delivery</h3>
          <p className="text-xs text-[#404944] leading-relaxed">
            Vehicles equipped with hydration reservoirs preserving freshness from our El Born atelier directly to your doorstep.
          </p>
        </div>
        <div className="p-6 bg-white border border-[#e7e5e4] rounded-lg space-y-2">
          <span className="text-2xl">🌿</span>
          <h3 className="font-serif text-lg text-[#1a1c1c] font-medium">100% Mediterranean Provenance</h3>
          <p className="text-xs text-[#404944] leading-relaxed">
            Wild and cultivated floral varieties sourced directly from verified local growers in Maresme and Girona.
          </p>
        </div>
        <div className="p-6 bg-white border border-[#e7e5e4] rounded-lg space-y-2">
          <span className="text-2xl">💌</span>
          <h3 className="font-serif text-lg text-[#1a1c1c] font-medium">Complimentary Calligraphy Card</h3>
          <p className="text-xs text-[#404944] leading-relaxed">
            Every arrangement includes a custom handwritten note on 350gsm textured cotton cardstock.
          </p>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#1a1c1c] font-normal">Explore Atelier Collections</h2>
          <Link to="/catalog" className="text-xs font-semibold text-[#064e3b] hover:underline">
            View All Creations →
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider whitespace-nowrap transition ${
              selectedCategoryId === null
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'bg-white border border-[#e2e2e2] text-[#404944] hover:text-[#1a1c1c] hover:border-[#064e3b]'
            }`}
          >
            All Creations
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider whitespace-nowrap transition ${
                selectedCategoryId === cat.id
                  ? 'bg-[#064e3b] text-white shadow-sm'
                  : 'bg-white border border-[#e2e2e2] text-[#404944] hover:text-[#1a1c1c] hover:border-[#064e3b]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Signature Arrangements Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e2e2e2] pb-3">
          <h2 className="font-serif text-2xl text-[#1a1c1c] font-normal">Signature Arrangements</h2>
          <span className="text-xs text-[#404944]">Handcrafted Daily</span>
        </div>

        {fetchError && (
          <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded-md text-xs text-[#9f1239] space-y-1">
            <p className="font-semibold">⚠️ Failed to load catalog from server</p>
            <p>{fetchError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-[#e8e8e7] rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : displayedProducts.length === 0 && !fetchError ? (
          <div className="p-8 text-center bg-white border border-[#e7e5e4] rounded-lg text-xs text-[#404944]">
            No items found for this collection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-[#e7e5e4] rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  {/* Кликабельная область картинки */}
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
                        In Stock
                      </span>
                    ) : (
                      <span className="absolute top-2.5 right-2.5 bg-[#fff1f2] text-[#9f1239] text-[10px] font-bold px-2 py-0.5 rounded border border-[#fecdd3]">
                        Out of Stock
                      </span>
                    )}
                  </Link>

                  <div className="p-4 space-y-1.5">
                    {/* Кликабельное название */}
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
                      + Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promotional Discount Banner */}
      <section className="bg-[#064e3b] text-white rounded-lg p-8 lg:p-12 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b0f0d6] block">
            PATRON PRIVILEGE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight">
            Register today as an Atelier Patron and receive 10% off your inaugural order.
          </h2>
          <p className="text-xs text-stone-200 leading-relaxed max-w-lg mx-auto">
            Enjoy priority delivery scheduling, saved Barcelona delivery addresses, and seasonal harvest announcements.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex h-11 px-8 bg-white text-[#064e3b] hover:bg-stone-100 text-xs font-semibold uppercase tracking-[0.1em] rounded transition items-center justify-center shadow-md"
            >
              Claim 10% Discount →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};