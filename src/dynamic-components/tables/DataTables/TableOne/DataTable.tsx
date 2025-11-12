"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "./Pagination";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
}
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  currentPage: number;
  rowsPerPage: number;
  totalEntries: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  search: string;
  onSearchChange: (value: string) => void;
  fileName?: string;

  // nuevo: control de filtro de status
  enableStatusFilter?: boolean; // si true mostramos el botón que abre el dropdown
  statusOptions?: string[]; // lista de statuses a mostrar en el dropdown
  statusFilter?: string | null; // valor actual del filtro (ej: 'Customer' o null)
  onStatusFilterChange?: (value: string | null) => void;
  enableAddButton?: boolean;
  // addFormRoute?: string | null;

  customActions?: React.ReactNode;
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  currentPage,
  rowsPerPage,
  totalEntries,
  onPageChange,
  onRowsPerPageChange,
  search,
  onSearchChange,
  fileName = "data",

  enableStatusFilter = false,
  statusOptions = [],
  statusFilter = null,
  onStatusFilterChange,

  enableAddButton = false,
  // addFormRoute = null,
  customActions
}: DataTableProps<T>) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + data.length;

  function toggleFilter() {
    setIsFilterOpen((s) => !s);
  }
  function closeFilter() {
    setIsFilterOpen(false);
  }

  function handleStatusSelect(value: string | null) {
    onStatusFilterChange?.(value);
    closeFilter();
  }

  const handleDownload = () => {
    // 1. Preparamos los datos con las columnas visibles
    const exportData = data.map((row: any) => {
      const obj: Record<string, any> = {};
      columns.forEach((col) => {
        const key = col.key as string;
        obj[col.label] = row[key]; // usamos la label como encabezado
      });
      return obj;
    });
  
    // 2. Worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
  
    // 3. Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
  
    // 4. Generar archivo Excel
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  
    // 5. Descargar
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
      {/* Header con controles */}
      <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400"> Mostrar </span>
          <select
            className="h-9 rounded-lg border border-gray-300 bg-transparent px-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            value={rowsPerPage}
            onChange={(e) => { onRowsPerPageChange(e); onPageChange(1); }}
          >
            {[5, 8, 10].map((n) => (
              <option key={n} value={n} className="text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {n}
              </option>
            ))}
          </select>
          <span className="text-gray-500 dark:text-gray-400"> registros </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Buscar..."
            className="h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 xl:w-[300px]"
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); onPageChange(1); }}
          />

          {/* botón de filtro (se muestra solo si enableStatusFilter=true) */}
          {enableStatusFilter && (
            <div className="relative">
              <button onClick={toggleFilter} className="h-9 px-2 rounded-lg border border-gray-300 bg-white flex items-center gap-2 text-sm dark:border-gray-700 dark:bg-gray-800">
                <MoreDotIcon className="text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Filtros</span>
              </button>

              <Dropdown isOpen={isFilterOpen} onClose={closeFilter} className="w-44 p-2 right-0">
                {/* opción All (quita filtro) */}
                <DropdownItem
                  onItemClick={() => handleStatusSelect(null)}
                  className={`flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 ${statusFilter === null ? "font-medium" : ""}`}
                >
                  Todos
                </DropdownItem>

                {statusOptions.map((s) => (
                  <DropdownItem
                    key={s}
                    onItemClick={() => handleStatusSelect(s)}
                    className={`flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 ${statusFilter === s ? "font-medium" : ""}`}
                  >
                    {s}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handleDownload}> Descargar </Button>

          {customActions}

          {enableAddButton && (
            <Link
              href="/add-product"
              className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            > 
              Agregar 
            </Link>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={String(col.key)} isHeader className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                  <span className="font-medium text-gray-700 dark:text-gray-400">{col.label}</span>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)} className="px-4 py-4 border border-gray-100 dark:border-white/[0.05] text-gray-800 dark:text-white/90 text-sm">
                    {col.render ? col.render(item) : (item[col.key] as any)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer con paginación */}
      <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 px-4 dark:border-white/[0.05]">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 xl:mb-0">
            {/* Mostrando {startIndex} de {endIndex} de {totalEntries} registros */}
            Mostrando {endIndex} de {totalEntries} registros
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(totalEntries / rowsPerPage))}
            onPageChange={(p) => p >= 1 && p <= Math.max(1, Math.ceil(totalEntries / rowsPerPage)) && onPageChange(p)}
          />
        </div>
      </div>
    </div>
  );
}
