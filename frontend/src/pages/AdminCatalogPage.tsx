// frontend/src/pages/AdminCatalogPage.tsx
import React, { useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient';
import { formatCurrency } from '../utils/formatters';
import type { Product } from '../types';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const AdminCatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchCatalogData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      // Параллельно подгружаем товары и категории
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/categories').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data || []);
      }

      if (catRes.data?.success && catRes.data?.data) {
        setCategories(catRes.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin catalog:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load catalog inventory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const handleOpenCreateModal = () => {
    const defaultCatId = categories.length > 0 ? categories[0].id : '';
    setEditingProduct({
      title: '',
      slug: '',
      description: 'Handcrafted floral creation sourced from regional growers in Catalonia.',
      price: 50 as any,
      wholesalePrice: 20 as any,
      stockQuantity: 10,
      composition: 'Roses, Eucalyptus',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      categoryId: defaultCatId,
      isAddon: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct({
      ...product,
      price: Number(product.price) as any,
      wholesalePrice: Number(product.wholesalePrice || 0) as any,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      
      const slugValue = editingProduct.slug?.trim() ||
        editingProduct.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ||
        'bouquet-item';

      // Гарантируем корректные типы для бэкенда и Prisma (categoryId обязателен)
      const payload = {
        title: editingProduct.title?.trim(),
        slug: slugValue,
        description: editingProduct.description || 'Exclusive botanical arrangement.',
        price: Number(editingProduct.price),
        wholesalePrice: Number(editingProduct.wholesalePrice || 0),
        stockQuantity: Number(editingProduct.stockQuantity || 0),
        composition: editingProduct.composition || null,
        imageUrl: editingProduct.imageUrl || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        isAddon: Boolean(editingProduct.isAddon),
        isActive: editingProduct.isActive ?? true,
        ...(editingProduct.categoryId ? { categoryId: editingProduct.categoryId } : {}),
      };

      if (editingProduct.id) {
        // PUT Обновление
        const res = await axiosClient.put(`/products/${editingProduct.id}`, payload);
        if (res.data.success) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.data.data : p)));
        }
      } else {
        // POST Создание
        const res = await axiosClient.post('/products', payload);
        if (res.data.success) {
          setProducts((prev) => [res.data.data, ...prev]);
        }
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Save product error:', err.response?.data || err);
      const msg = err.response?.data?.error?.message || 'Failed to save product details.';
      alert(`⚠️ ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Безопасная деактивация (Soft Delete) вместо жесткого DELETE из-за Foreign Key связей в БД
  const handleToggleDeactivate = async (product: Product) => {
    const actionWord = product.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionWord} "${product.title}"?`)) return;

    try {
      const res = await axiosClient.put(`/products/${product.id}`, {
        ...product,
        price: Number(product.price),
        wholesalePrice: Number(product.wholesalePrice || 0),
        isActive: !product.isActive,
      });

      if (res.data.success) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? res.data.data : p)));
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
            Atelier Inventory Management • Executive Admin
          </span>
          <h1 className="font-serif text-3xl text-[#1a1c1c] font-normal">
            Manage Catalog Items
          </h1>
          <p className="text-xs text-[#404944]">
            Create new arrangements, adjust retail pricing, and update stock counts.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="h-10 px-5 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-wider rounded transition shadow-sm self-start sm:self-auto flex items-center gap-2"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239]">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Product Table */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b] mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white border border-[#e7e5e4] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#404944]">
              <thead className="bg-[#fafaf9] border-b border-[#e2e2e2] text-[10px] font-bold uppercase tracking-wider text-[#1a1c1c]">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Retail Price</th>
                  <th className="p-3">Wholesale Price</th>
                  <th className="p-3">Stock Count</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fafaf9] transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded bg-[#f5f5f4] border border-[#e2e2e2]"
                        />
                        <div>
                          <span className="font-bold text-[#1a1c1c] block">{product.title}</span>
                          <span className="text-[10px] text-[#707974] truncate max-w-[180px] block">
                            {product.composition || 'No composition specified'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#064e3b]">
                      {product.slug}
                    </td>
                    <td className="p-3 font-bold text-[#1a1c1c]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-3 text-[#707974]">
                      {formatCurrency(product.wholesalePrice || 0)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          product.stockQuantity > 5
                            ? 'bg-[#ecfdf5] text-[#065f46] border border-[#bbf7d0]'
                            : product.stockQuantity > 0
                            ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                            : 'bg-[#fff1f2] text-[#9f1239] border border-[#fecdd3]'
                        }`}
                      >
                        {product.stockQuantity} units
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          product.isActive
                            ? 'bg-[#ecfdf5] text-[#065f46]'
                            : 'bg-[#f5f5f4] text-stone-500'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="px-2.5 py-1 bg-[#fafaf9] border border-[#d6d3d1] text-[#1a1c1c] hover:border-[#064e3b] text-[11px] font-semibold rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleDeactivate(product)}
                        className={`px-2.5 py-1 border text-[11px] font-semibold rounded transition ${
                          product.isActive
                            ? 'bg-[#fff1f2] border-[#fecdd3] text-[#9f1239] hover:bg-[#ffe4e6]'
                            : 'bg-[#ecfdf5] border-[#bbf7d0] text-[#065f46]'
                        }`}
                      >
                        {product.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Product */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e7e5e4] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl my-8">
            <div className="flex justify-between items-center border-b border-[#f5f5f4] pb-3">
              <h3 className="font-serif text-xl text-[#1a1c1c] font-medium">
                {editingProduct.id ? 'Edit Product Item' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  placeholder="e.g. Crimson Romance Bouquet"
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.categoryId || categories[0]?.id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={editingProduct.slug || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                  placeholder="crimson-romance-bouquet"
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                    Retail (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 as any })}
                    className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                    Wholesale (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.wholesalePrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePrice: parseFloat(e.target.value) || 0 as any })}
                    className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                    Stock Qty *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stockQuantity ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  Composition / Ingredients
                </label>
                <input
                  type="text"
                  value={editingProduct.composition || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, composition: e.target.value })}
                  placeholder="15 Red Roses, Eucalyptus, Satin Ribbon"
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 border border-[#d6d3d1] hover:bg-[#fafaf9] text-[#1a1c1c] font-semibold uppercase tracking-wider rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 bg-[#064e3b] hover:bg-[#022c22] text-white font-semibold uppercase tracking-wider rounded transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};