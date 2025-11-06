type Product = {
  id: string;
  name?: string | null;
};

type OrderDetail = {
  id: string;
  order_id: string;
  product_id?: string | null;
  quantity: number;
  unit_price: string | number;
  created_at?: string;
  product?: Product | null; 
};

export default function InvoiceTable({ items }: { items?: OrderDetail[] | null }) {
  const safeItems = items ?? [];
  const subtotal = safeItems.reduce((acc, it) => acc + (Number(it.unit_price) || 0) * (Number(it.quantity) || 0), 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
      <table className="min-w-full text-left text-gray-700 dark:text-gray-400">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="px-5 py-3 text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">No.#</th>
            <th className="px-5 py-3 text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">Producto</th>
            <th className="px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">Cantidad</th>
            <th className="px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">Precio</th>
            <th className="px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">Descuento</th>
            <th className="px-5 py-3 text-right text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-400">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {safeItems.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Sin productos</td>
            </tr>
          )}

          {safeItems.map((item, idx) => {
            const productName = item.product?.name ?? "(no product)";
            const lineTotal = (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);
            return (
              <tr key={item.id}>
                <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-gray-400">{productName}</td>
                <td className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                <td className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">{item.unit_price}</td>
                <td className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">0</td>
                <td className="px-5 py-3 text-right text-sm text-gray-500 dark:text-gray-400">{lineTotal}</td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={5} className="px-5 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-400">Subtotal</td>
            <td className="px-5 py-4 text-right text-sm text-gray-500 dark:text-gray-400">{subtotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}