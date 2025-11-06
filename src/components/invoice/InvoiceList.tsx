"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import TableDropdown from "../common/TableDropdown";

// Types
export type Invoice = {
  id: string;
  number?: string; // optional: if your DB has an invoice/order number column
  customer: string;
  creationDate: string; // ISO or friendly string
  total: number;
  status: "Paid" | "Unpaid" | "Draft" | string;
};

type SortState = {
  sortBy: "number" | "customer" | "creationDate" | "total";
  sortDirection: "asc" | "desc";
};

type InvoiceListTableProps = {
  invoices?: Invoice[];
  /**
   * Optional function to load invoices (eg. from Supabase). If provided, it will
   * be executed on mount and whenever the function identity changes.
   */
  fetchInvoices?: () => Promise<Invoice[]>;
  itemsPerPage?: number;
};

// Small demo data (string ids to match DB UUIDs)
const demoInvoices: Invoice[] = [
  {
    id: "1",
    number: "#323534",
    customer: "Lindsey Curtis",
    creationDate: "2024-08-07",
    total: 999,
    status: "Paid",
  },
  {
    id: "2",
    number: "#323535",
    customer: "John Doe",
    creationDate: "2024-07-01",
    total: 1200,
    status: "Unpaid",
  },
];

export function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0 });
}

export function formatDate(iso: string | undefined) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

/**
 * Helper: map a DB order row to the `Invoice` shape. Adjust field names to your
 * actual DB result (eg. order.number, contact.display_name, etc.)
 */
export function mapOrdersToInvoices(orders: any[]): Invoice[] {
  return orders.map((o) => ({
    id: String(o.id),
    number: o.id,
    customer: o.name ?? o.contacts.name ?? o.contact_name ?? "Unknown",
    creationDate: o.created_at ?? o.creation_date ?? new Date().toISOString(),
    total: Number(o.total ?? 0),
    status: (o.status ?? "pending") === "paid" ? "Paid" : (o.status ?? "pending"),
  }));
}

export default function InvoiceListTable({
  invoices: invoicesProp,
  fetchInvoices,
  itemsPerPage = 10,
}: InvoiceListTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(invoicesProp ?? demoInvoices);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<SortState>({
    sortBy: "number",
    sortDirection: "asc",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<"All" | "Unpaid" | "Draft" | "Paid">("All");
  const [search, setSearch] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(false);

  // If fetchInvoices prop is provided, call it on mount and populate invoices
  useEffect(() => {
    let mounted = true;
    if (fetchInvoices) {
      setLoading(true);
      fetchInvoices()
        .then((data) => {
          if (mounted && Array.isArray(data)) setInvoices(data);
        })
        .catch((err) => {
          // optional: handle error
          console.error("fetchInvoices error", err);
        })
        .finally(() => mounted && setLoading(false));
    }
    return () => {
      mounted = false;
    };
  }, [fetchInvoices]);

  // Derived lists
  const filteredInvoices: Invoice[] = useMemo(() => {
    return filterStatus === "All"
      ? invoices
      : invoices.filter((invoice) => invoice.status === filterStatus);
  }, [invoices, filterStatus]);

  const searchedInvoices: Invoice[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredInvoices;
    return filteredInvoices.filter((invoice) =>
      [invoice.number, invoice.customer]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [filteredInvoices, search]);

  const sortedInvoices: Invoice[] = useMemo(() => {
    return [...searchedInvoices].sort((a, b) => {
      let valA: string | number = (a as any)[sort.sortBy] ?? "";
      let valB: string | number = (b as any)[sort.sortBy] ?? "";
      if (sort.sortBy === "total") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = typeof valA === "string" ? valA.toLowerCase() : valA;
        valB = typeof valB === "string" ? valB.toLowerCase() : valB;
      }
      if (valA < valB) return sort.sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sort.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [searchedInvoices, sort]);

  const totalPages: number = Math.max(1, Math.ceil(sortedInvoices.length / itemsPerPage));
  const startEntry: number = sortedInvoices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry: number = Math.min(currentPage * itemsPerPage, sortedInvoices.length);

  const paginatedInvoices: Invoice[] = sortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const visiblePages: number[] = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const toggleSelectAll = (): void => {
    if (paginatedInvoices.length > 0 && paginatedInvoices.every((i) => selected.includes(i.id))) {
      setSelected([]);
    } else {
      setSelected(paginatedInvoices.map((i) => i.id));
    }
  };

  const toggleRow = (id: string): void => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const sortBy = (field: "number" | "customer" | "creationDate" | "total") => {
    setSort((prev) => ({
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const previousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Invoices</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your most recent invoices list</p>
        </div>
        <div className="flex gap-3.5">
          <div className="hidden h-11 items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 lg:inline-flex dark:bg-gray-900">
            <button
              onClick={() => {
                setFilterStatus("All");
                setCurrentPage(1);
              }}
              className={`text-theme-sm h-10 rounded-md px-3 py-2 font-medium hover:text-gray-900 dark:hover:text-white ${
                filterStatus === "All"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              All Invoices
            </button>
            <button
              onClick={() => {
                setFilterStatus("Unpaid");
                setCurrentPage(1);
              }}
              className={`text-theme-sm h-10 rounded-md px-3 py-2 font-medium hover:text-gray-900 dark:hover:text-white ${
                filterStatus === "Unpaid"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Unpaid
            </button>
            <button
              onClick={() => {
                setFilterStatus("Draft");
                setCurrentPage(1);
              }}
              className={`text-theme-sm h-10 rounded-md px-3 py-2 font-medium hover:text-gray-900 dark:hover:text-white ${
                filterStatus === "Draft"
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Draft
            </button>
          </div>
          <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-44">
              {/* Filter dropdown component can be used here */}
            </div>
            <button className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-[11px] text-sm font-medium text-gray-700 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 text-center">Cargando...</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                <th className="p-4 whitespace-nowrap">
                  <div className="flex w-full cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="flex cursor-pointer items-center text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                        <span className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={
                              paginatedInvoices.length > 0 && paginatedInvoices.every((i) => selected.includes(i.id))
                            }
                            onChange={toggleSelectAll}
                          />
                          <span className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${
                            paginatedInvoices.length > 0 && paginatedInvoices.every((i) => selected.includes(i.id))
                              ? "border-brand-500 bg-brand-500"
                              : "bg-transparent border-gray-300 dark:border-gray-700"
                          }`}>
                            <span className={paginatedInvoices.length > 0 && paginatedInvoices.every((i) => selected.includes(i.id)) ? "" : "opacity-0"}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.6666" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                          </span>
                        </span>
                      </label>
                      <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">Invoice Number</p>
                    </div>
                  </div>
                </th>
                <th className="cursor-pointer p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400" onClick={() => sortBy("customer")}>Customer</th>
                <th className="cursor-pointer p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400" onClick={() => sortBy("creationDate")}>Creation Date</th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">Total</th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400">Status</th>
                <th className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 whitespace-nowrap">
                    <div className="group flex items-center gap-3">
                      <label className="flex cursor-pointer items-center text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                        <span className="relative">
                          <input type="checkbox" className="sr-only" checked={selected.includes(invoice.id)} onChange={() => toggleRow(invoice.id)} />
                          <span className={`flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] ${selected.includes(invoice.id) ? "border-brand-500 bg-brand-500" : "bg-transparent border-gray-300 dark:border-gray-700"}`}>
                            <span className={selected.includes(invoice.id) ? "" : "opacity-0"}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.6666" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                          </span>
                        </span>
                      </label>
                      <Link href="/single-invoice" className="text-theme-xs font-medium text-gray-700 group-hover:underline dark:text-gray-400">{invoice.number ?? invoice.id}</Link>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-700 dark:text-gray-400">{invoice.customer}</span></td>
                  <td className="p-4 whitespace-nowrap"><p className="text-sm text-gray-700 dark:text-gray-400">{formatDate(invoice.creationDate)}</p></td>
                  <td className="p-4 whitespace-nowrap"><p className="text-sm text-gray-700 dark:text-gray-400">${formatCurrency(invoice.total)}</p></td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`text-theme-xs rounded-full px-2 py-0.5 font-medium ${
                      invoice.status === "Paid"
                        ? "bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500"
                        : invoice.status === "Unpaid"
                        ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400"
                    }`}>{invoice.status}</span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="relative flex justify-center dropdown">
                      <TableDropdown
                        dropdownButton={<button className="text-gray-500 dark:text-gray-400 ">•••</button>}
                        dropdownContent={<>
                          <button className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">View More</button>
                          <button className="text-xs flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">Delete</button>
                        </>}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="pb-4 sm:pb-0">
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Showing <span className="text-gray-800 dark:text-white/90">{startEntry}</span> to <span className="text-gray-800 dark:text-white/90">{endEntry}</span> of <span className="text-gray-800 dark:text-white/90">{sortedInvoices.length}</span></span>
        </div>
        <div className="flex items-center justify-between gap-2 bg-gray-50 p-4 sm:p-0 rounded-lg sm:bg-transparent dark:sm:bg-transparent w-full sm:w-auto dark:bg-white/[0.03] sm:justify-normal">
          <button onClick={previousPage} disabled={currentPage === 1} className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
            ‹
          </button>
          <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">Page {currentPage} of {totalPages}</span>
          <ul className="hidden items-center gap-0.5 sm:flex">
            {visiblePages.map((page) => (
              <li key={page}>
                <button onClick={() => goToPage(page)} className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${page === currentPage ? "bg-brand-500 text-white" : "hover:bg-brand-500 text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"}`}>{page}</button>
              </li>
            ))}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                <li><span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">...</span></li>
                <li><button onClick={() => goToPage(totalPages)} className="hover:bg-brand-500 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white">{totalPages}</button></li>
              </>
            )}
          </ul>
          <button onClick={nextPage} disabled={currentPage === totalPages} className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
