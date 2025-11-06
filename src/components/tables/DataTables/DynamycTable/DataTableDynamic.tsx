"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import Pagination from "./Pagination";
import Button from "../../../ui/button/Button";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
}: DataTableProps<T>) {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
      {/* Header con controles */}
      <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400"> Show </span>
          <select
            className="h-9 rounded-lg border border-gray-300 bg-transparent px-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            {[5, 8, 10].map((n) => (
              <option
                key={n}
                value={n}
                className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
              >
                {n}
              </option>
            ))}
          </select>
          <span className="text-gray-500 dark:text-gray-400"> entries </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 xl:w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" size="sm">
            Download
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  isHeader
                  className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-400">
                    {col.label}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id}>
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className="px-4 py-4 border border-gray-100 dark:border-white/[0.05] text-gray-800 dark:text-white/90 text-sm"
                  >
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
            Showing {startIndex + 1} to {endIndex} of {totalEntries} entries
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => p >= 1 && p <= totalPages && setCurrentPage(p)}
          />
        </div>
      </div>
    </div>
  );
}
