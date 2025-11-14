"use client";

import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useClientOrders } from "@/hooks/useClientOrders";

export default function ClientOrdersPage() {
    const params = useParams();
    const id = params.id;

    const { orders, loading, error } = useClientOrders(id as string);

    if (loading) return <p className="p-4">Cargando órdenes...</p>;
    if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

    return (
       <>
        <PageBreadcrumb pageTitle="Órdenes del cliente"/>
        <ComponentCard title="Órdenes">
          
          {orders.length === 0 ? (
          <p>No hay órdenes para este cliente.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                <h3 className="font-semibold">Orden #{order.id}</h3>
                <p>Estado:  
                  <Badge color={order.status == "paid" ? "success" : "warning"}>
                    {order.status == "paid" ? "Pagado" : "Pendiente"}
                  </Badge>
                </p>
                <p>Total: ${order.total}</p>
                <p>Fecha: {new Date(order.created_at).toLocaleString()}</p>

                <h4 className="mt-2 font-medium">Productos:</h4>
                <ul className="list-disc pl-6">
                  {order.order_details.map((detail) => (
                    <li key={detail.id}>
                      {detail.product?.name} — {detail.quantity} × ${detail.unit_price}
                    </li>
                  ))}
                </ul>

                {order.order_promotions.length > 0 && (
                  <>
                    <h4 className="mt-2 font-medium">Promociones aplicadas:</h4>
                    <ul className="list-disc pl-6">
                      {order.order_promotions.map((promo) => (
                        <li key={promo.id}>
                          {promo.promotion.name} — {promo.promotion.discount_type} ({promo.discount_amount})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}


        </ComponentCard>
       </>
    );
}