"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Button from "../ui/button/Button";
import InvoiceTable from "./InvoiceTable";

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

type Order = {
  id: string;
  organization_id?: string | null;
  customer_id?: string | null;
  status: string;
  total: string | number;
  created_at: string;
  updated_at?: string;
  order_details?: OrderDetail[];
};

export default function InvoiceMain({ order }: { order?: Order | null }) {
  const total = order ? Number(order.total || 0) : 0;
  const invoiceRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!invoiceRef.current) return;
    
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, { 
      scale: 3,
      ignoreElements: (el) => el.classList.contains("no-print"),
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Pedido_${order?.id ?? "NO_ID"}.pdf`);
  }

  return (
    <div ref={invoiceRef} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-medium text-gray-800 text-theme-xl dark:text-gray-200">Detalle del pedido</h3>

        <h4 className="text-base font-medium text-gray-700 dark:text-gray-400">ID : {order?.id ?? "#-"}</h4>
      </div>

      <div className="p-5 xl:p-8">
        {/* Invoice Table Start */}
        <InvoiceTable items={order?.order_details ?? []} />
        {/* Invoice Table End */}

        <div className="pb-6 my-6 text-right border-b border-gray-100 dark:border-gray-800">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total : {total}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button onClick={handleDownload} className="no-print">
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.99578 4.08398C6.58156 4.08398 6.24578 4.41977 6.24578 4.83398V6.36733H13.7542V5.62451C13.7542 5.42154 13.672 5.22724 13.5262 5.08598L12.7107 4.29545C12.5707 4.15983 12.3835 4.08398 12.1887 4.08398H6.99578ZM15.2542 6.36902V5.62451C15.2542 5.01561 15.0074 4.43271 14.5702 4.00891L13.7547 3.21839C13.3349 2.81151 12.7733 2.58398 12.1887 2.58398H6.99578C5.75314 2.58398 4.74578 3.59134 4.74578 4.83398V6.36902C3.54391 6.41522 2.58374 7.40415 2.58374 8.61733V11.3827C2.58374 12.5959 3.54382 13.5848 4.74561 13.631V15.1665C4.74561 16.4091 5.75297 17.4165 6.99561 17.4165H13.0041C14.2467 17.4165 15.2541 16.4091 15.2541 15.1665V13.6311C16.456 13.585 17.4163 12.596 17.4163 11.3827V8.61733C17.4163 7.40414 16.4561 6.41521 15.2542 6.36902ZM4.74561 11.6217V12.1276C4.37292 12.084 4.08374 11.7671 4.08374 11.3827V8.61733C4.08374 8.20312 4.41953 7.86733 4.83374 7.86733H15.1663C15.5805 7.86733 15.9163 8.20312 15.9163 8.61733V11.3827C15.9163 11.7673 15.6269 12.0842 15.2541 12.1277V11.6217C15.2541 11.2075 14.9183 10.8717 14.5041 10.8717H5.49561C5.08139 10.8717 4.74561 11.2075 4.74561 11.6217ZM6.24561 12.3717V15.1665C6.24561 15.5807 6.58139 15.9165 6.99561 15.9165H13.0041C13.4183 15.9165 13.7541 15.5807 13.7541 15.1665V12.3717H6.24561Z" fill=""/>
            </svg>
            Descargar
          </Button>
        </div>
      </div>
    </div>
  );
}