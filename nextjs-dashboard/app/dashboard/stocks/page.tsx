'use client';

import { useEffect, useState } from 'react';
import StocksTable from '@/app/ui/stocks/table';
import { lusitana } from '@/app/ui/fonts';

interface StockItem {
  id: string;
  item_name: string;
  sku: string;
  quantity: number;
  warehouse: string;
  category: string;
  price: number;
  last_updated: string;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('410544b2-4001-4271-9855-fec4b6a6442a'); // Default to user1

  useEffect(() => {
    // In a real app, you'd get the userId from session/auth
    // For now, you can change this to test different users
    // setUserId('410544b2-4001-4271-9855-fec4b6a6442b'); // user2

    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stocks?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stocks');
        }
        const data = await response.json();
        setStocks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [userId]);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Inventory Management
      </h1>
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-600">Total Items: <span className="font-semibold text-emerald-600">{stocks.length}</span></p>
        </div>
        <div>
          <label className="mr-2 text-sm text-gray-600">Switch User:</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="410544b2-4001-4271-9855-fec4b6a6442a">User 1</option>
            <option value="410544b2-4001-4271-9855-fec4b6a6442b">User 2</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <p className="text-gray-600">Loading stocks...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {!loading && !error && <StocksTable stocks={stocks} />}
    </main>
  );
}
