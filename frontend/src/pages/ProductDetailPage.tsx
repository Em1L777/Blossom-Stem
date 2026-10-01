// frontend/src/pages/ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import type { Product } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setErrorMsg(null);
        setQuantity(1);

        // 1. Загружаем основной товар по slug
        const response = await axiosClient.get(`/products/slug/${slug}`);

        if (response.data.success) {
          const currentProduct: Product = response.data.data;
          setProduct(currentProduct);

          // 2. Загружаем похожие товары для блока рекомендаций
          try {
            const allProductsRes = await axiosClient.get('/products');
            if (allProductsRes.data.success) {
              const all: Product[] = allProductsRes.data.data || [];
              const related = all
                .filter((p) => p.id !== currentProduct.id)
                .slice(0, 3);
              setRelatedProducts(related);
            }
          } catch {
            // Игнорируем ошибку загрузки рекомендаций
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch product detail:', err);
        const message =
          err.response?.status === 404
            ? 'The requested arrangement or item could not be found in our atelier.'
            : 'Could not connect to server. Please try again later.';
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stockQuantity) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stockQuantity > 0) {
      addToCart(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#064e3b]"></div>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <span className="text-4xl">🥀</span>
        <h2 className="font-serif text-2xl text-[#1a1c1c]">Arrangement Not Found</h2>
        <p className="text-xs text-[#404944] max-w-md">{errorMsg}</p>
        <Link
          to="/catalog"
          className="px-6 py-2.5 bg-[#064e3b] text-white text-xs font-semibold uppercase tracking-wider rounded shadow-sm hover:bg-[#022c22] transition"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Breadcrumbs */}
      <nav className="text-xs text-[#404944] flex items-center gap-2 border-b border-[#e2e2e2] pb-3">
        <Link to="/" className="hover:text-[#064e3b]">
          Home
        </Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-[#064e3b]">
          Catalog
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/catalog?category=${product.categoryId}`}
              className="hover:text-[#064e3b]"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#1a1c1c] font-semibold truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* 2. Main Product Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] bg-[#f5f5f4] rounded-lg overflow-hidden border border-[#e7e5e4] shadow-sm">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#064e3b] px-2.5 py-1 rounded border border-[#e2e2e2]">
              {product.category?.name || (product.isAddon ? 'Gift Card' : 'Arrangement')}
            </span>
          </div>

          <div className="flex gap-3">
            <div className="w-20 h-20 bg-[#f5f5f4] rounded border-2 border-[#064e3b] overflow-hidden cursor-pointer">
              <img
                src={product.imageUrl}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Details & Order Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 border-b border-[#e2e2e2] pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b] block">
              Atelier Nº {product.id.slice(0, 4).toUpperCase()} — Barcelona
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1c1c] font-normal leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center justify-between pt-1">
              <span className="font-semibold text-2xl text-[#1a1c1c]">
                {formatCurrency(product.price)}
              </span>
              {product.stockQuantity > 0 ? (
                <span className="bg-[#ecfdf5] text-[#065f46] text-xs font-bold px-3 py-1 rounded border border-[#bbf7d0]">
                  ✓ In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="bg-[#fff1f2] text-[#9f1239] text-xs font-bold px-3 py-1 rounded border border-[#fecdd3]">
                  ✕ Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Story Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c]">
              Arrangement Story
            </h3>
            <p className="text-xs text-[#404944] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Composition Details */}
          {product.composition && (
            <div className="bg-[#white] p-4 rounded border border-[#e7e5e4] space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#064e3b] flex items-center gap-1.5">
                <span>🌿</span> Floral Ingredients & Composition
              </h3>
              <p className="text-xs text-[#1a1c1c] leading-relaxed">
                {product.composition}
              </p>
            </div>
          )}

          {/* Purchasing Controls */}
          {product.stockQuantity > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#1a1c1c] uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-[#d6d3d1] rounded bg-white">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-9 h-9 flex items-center justify-center text-sm text-[#1a1c1c] hover:bg-[#f5f5f4] disabled:opacity-30 transition"
                  >
                    –
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#1a1c1c]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                    className="w-9 h-9 flex items-center justify-center text-sm text-[#1a1c1c] hover:bg-[#f5f5f4] disabled:opacity-30 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full h-12 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-[0.12em] rounded transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>🛒 Add to Cart</span>
                <span>•</span>
                <span>{formatCurrency(Number(product.price) * quantity)}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239]">
              This arrangement is currently out of stock. Check back tomorrow for fresh harvest arrivals from Catalan growers.
            </div>
          )}

          {/* Delivery & Care Guarantees */}
          <div className="border-t border-[#e2e2e2] pt-4 space-y-2.5 text-xs text-[#404944]">
            <div className="flex items-start gap-2.5">
              <span className="text-base">🚚</span>
              <div>
                <span className="font-bold text-[#1a1c1c]">Same-Day Barcelona Delivery</span>
                <p className="text-[11px] leading-normal">
                  Delivered in hydration reservoir packaging preserving optimal stem freshness.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-base">💌</span>
              <div>
                <span className="font-bold text-[#1a1c1c]">Complimentary Calligraphy Card</span>
                <p className="text-[11px] leading-normal">
                  Write a custom personal message during checkout for hand-inscribed placement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. You May Also Cherish (Recommendations) */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-[#e2e2e2]">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#1a1c1c] font-normal">
              You May Also Cherish
            </h2>
            <Link to="/catalog" className="text-xs font-semibold text-[#064e3b] hover:underline">
              Explore Full Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="bg-white border border-[#e7e5e4] rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  <div className="relative aspect-[4/5] bg-[#f5f5f4] overflow-hidden">
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <Link
                      to={`/product/${rel.slug}`}
                      className="font-serif text-base text-[#1a1c1c] font-medium hover:text-[#064e3b] transition block line-clamp-1"
                    >
                      {rel.title}
                    </Link>
                    <p className="text-[11px] text-[#404944]">
                      {formatCurrency(rel.price)}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => navigate(`/product/${rel.slug}`)}
                    className="w-full h-8 bg-[#fafaf9] border border-[#e2e2e2] text-[#1a1c1c] hover:border-[#064e3b] text-[11px] font-semibold uppercase tracking-wider rounded transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};