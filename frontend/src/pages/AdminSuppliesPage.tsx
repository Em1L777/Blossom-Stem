// frontend/src/pages/AdminSuppliesPage.tsx
import React, { useState, useEffect } from 'react';

interface SupplyItem {
  id: string;
  name: string;
  category: 'Fresh Cut Stems' | 'Packaging' | 'Stationery';
  supplier: string;
  currentStock: number;
  minThreshold: number;
  unit: 'stems' | 'units' | 'reels';
  lastRestocked: string;
}

const DEFAULT_SUPPLIES: SupplyItem[] = [
  {
    id: 'SUP-01',
    name: 'Red Freedom Roses (70cm)',
    category: 'Fresh Cut Stems',
    supplier: 'Maresme Floral Co-op (Alella)',
    currentStock: 140,
    minThreshold: 50,
    unit: 'stems',
    lastRestocked: '2026-09-28',
  },
  {
    id: 'SUP-02',
    name: 'Eucalyptus Cinerea Branches',
    category: 'Fresh Cut Stems',
    supplier: 'Girona Botanical Harvest',
    currentStock: 25,
    minThreshold: 40,
    unit: 'stems',
    lastRestocked: '2026-09-25',
  },
  {
    id: 'SUP-03',
    name: 'Pink Sarah Bernhardt Peonies',
    category: 'Fresh Cut Stems',
    supplier: 'Maresme Floral Co-op (Alella)',
    currentStock: 80,
    minThreshold: 30,
    unit: 'stems',
    lastRestocked: '2026-09-29',
  },
  {
    id: 'SUP-04',
    name: '350gsm Textured Italian Cotton Cards',
    category: 'Stationery',
    supplier: 'Barcelona Calligraphy Press',
    currentStock: 220,
    minThreshold: 100,
    unit: 'units',
    lastRestocked: '2026-09-15',
  },
  {
    id: 'SUP-05',
    name: 'Hydration Reservoir Eco-Sleeves',
    category: 'Packaging',
    supplier: 'Catalunya EcoPack',
    currentStock: 18,
    minThreshold: 50,
    unit: 'units',
    lastRestocked: '2026-09-10',
  },
];

export const AdminSuppliesPage: React.FC = () => {
  // Персистентная загрузка из localStorage
  const [supplies, setSupplies] = useState<SupplyItem[]>(() => {
    const saved = localStorage.getItem('blossom_admin_supplies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SUPPLIES;
  });

  const [orderingId, setOrderingId] = useState<string | null>(null);

  // Сохраняем в localStorage при каждом изменении состояния
  useEffect(() => {
    localStorage.setItem('blossom_admin_supplies', JSON.stringify(supplies));
  }, [supplies]);

  const handleReorder = (id: string) => {
    setOrderingId(id);
    setTimeout(() => {
      setSupplies((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                currentStock: s.currentStock + 100,
                lastRestocked: new Date().toISOString().split('T')[0],
              }
            : s
        )
      );
      setOrderingId(null);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
            Raw Materials & Botanical Inventory • El Born Atelier
          </span>
          <h1 className="font-serif text-3xl text-[#1a1c1c] font-normal">
            Floristry Supplies & Raw Stems
          </h1>
          <p className="text-xs text-[#404944]">
            Monitor fresh flower stem reserves, packaging stock, and place B2B supplier re-orders.
          </p>
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-white border border-[#e7e5e4] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#404944]">
            <thead className="bg-[#fafaf9] border-b border-[#e2e2e2] text-[10px] font-bold uppercase tracking-wider text-[#1a1c1c]">
              <tr>
                <th className="p-3">Supply Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Supplier Origin</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Restocked</th>
                <th className="p-3 text-right">Wholesale Re-order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f4]">
              {supplies.map((item) => {
                const isLow = item.currentStock < item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-[#fafaf9] transition">
                    <td className="p-3 font-bold text-[#1a1c1c]">
                      {item.name}
                    </td>
                    <td className="p-3 text-[11px] font-medium text-[#707974]">
                      {item.category}
                    </td>
                    <td className="p-3 text-[11px] text-[#064e3b] font-medium">
                      {item.supplier}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#1a1c1c]">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="p-3">
                      {isLow ? (
                        <span className="bg-[#fff1f2] text-[#9f1239] text-[10px] font-bold px-2.5 py-0.5 rounded border border-[#fecdd3] uppercase">
                          ⚠️ Low Stock Threshold
                        </span>
                      ) : (
                        <span className="bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold px-2.5 py-0.5 rounded border border-[#bbf7d0] uppercase">
                          ✓ Optimal Reserve
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#707974] whitespace-nowrap">
                      {item.lastRestocked}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleReorder(item.id)}
                        disabled={orderingId === item.id}
                        className="px-3 py-1 bg-[#064e3b] hover:bg-[#022c22] text-white text-[11px] font-semibold uppercase tracking-wider rounded transition disabled:opacity-50 shadow-sm"
                      >
                        {orderingId === item.id ? 'Ordering...' : '+ Order +100 Units'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};