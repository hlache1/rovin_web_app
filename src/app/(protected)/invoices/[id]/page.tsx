"use client"

import React from "react";
import { useParams } from "next/navigation";
import { useOrderDetails } from "@/hooks/useOrderDetails";

import InvoiceMain from "@/components/invoice/InvoiceMain";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function InvoiceDetailPage() {
    const params = useParams();
    const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

    const { order, loading } = useOrderDetails(orderId);

    if (loading) return <div>Loading...</div>;
   
  return (
    <div>
      <PageBreadcrumb pageTitle="Pedido" />
    <InvoiceMain order={order}/>
    </div>
  );
}
