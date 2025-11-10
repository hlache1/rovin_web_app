"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * useProducts: Retrieves a paginated list of products from Supabase with optional search and status filtering.
 *
 * @param page number (1-based)
 * @param rowsPerPage number
 * @param search string
 */
export function useProducts(page: number, rowsPerPage: number, search: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      setLoading(true);
      const start = Math.max(0, (page - 1) * rowsPerPage);
      const end = start + rowsPerPage - 1;

      let base = supabase
        .from('products')
        .select('id, name, stock, price, brand, category, status, product_retailer_id, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search && search.trim().length > 0) {
        const s = `%${search.replace(/%/g, '\%')}%`;
        base = supabase
          .from('products')
          .select('id, name, stock, price, brand, category, status, product_retailer_id, created_at', { count: 'exact' })
          .or(`name.ilike.${s},brand.ilike.${s},category.ilike.${s}`)
          .order('created_at', { ascending: false })
      }

      const query = base.range(start, end);

      const { data, error, count } = await query;

      if (error) {
        if (mounted) {
          setProducts([]);
          setTotal(0);
          setLoading(false);
        }
      } else if (mounted) {
        setProducts(data || []);
        setTotal(typeof count === 'number' ? count : (data || []).length);
        setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [page, rowsPerPage, search]);

  return { products, total, loading };
}