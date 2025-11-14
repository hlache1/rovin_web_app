"use client"

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import LeadsChart from "@/dynamic-components/charts/LeadsChart";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { useLeadsStats } from "@/hooks/useLeadsStats";
import { LEAD_STATUSES } from "@/utils/statuses";

export default function DashboardPage() {
  const { stats, loading } = useLeadsStats();

  if (loading) return <p>Loading...</p>;

  return (
    <main className="">
      <section className="grid p-3 rounded-2xl">
        <h1 className="text-xl font-medium mb-3 dark:text-gray-300">
          Datos de tus leads
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          {stats.map((item) => {
            const growth =
              item.previous_count === 0
                ? 100
                : ((item.current_count - item.previous_count) /
                    item.previous_count) *
                  100;

            const statusInfo = LEAD_STATUSES.find((s) => s.key === item.status);

            return (
              <div key={item.status} className="col-span-1 sm:col-span-2 lg:col-span-2">
                {/* Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{statusInfo?.emoji}</span>

                    <Badge color={growth >= 0 ? "success" : "error"}>
                      {growth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                      {growth.toFixed(2)}%
                    </Badge>
                  </div>

                  {/* Main counts */}
                  <div className="mt-4">
                    <span className="text-md text-gray-500 dark:text-gray-400">
                      {statusInfo?.plural ?? ""}
                    </span>

                    <div className="flex items-end gap-2 mt-1">
                      <h4 className="font-bold text-gray-800 text-3xl dark:text-white/90">
                        {item.current_count}
                      </h4>
                      <p className="mb-1 text-xs text-gray-500">clientes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mt-6 text-sm md:text-md">
                    <div className="rounded-xl bg-gray-50 dark:bg-white/[0.06] p-3">
                      <p className="text-xs text-gray-500">Total ventas</p>
                      <p className="font-semibold text-gray-700 dark:text-white">
                        $ {item.total_sales?.toFixed(2)} MXN
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-white/[0.06] p-3">
                      <p className="text-xs text-gray-500">Total pedidos</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {item.total_orders ?? "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-white/[0.06] p-3">
                      <p className="text-xs text-gray-500">Pedidos mes</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {item.orders_this_month ?? "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 dark:bg-white/[0.06] p-3">
                      <p className="text-xs text-gray-500">Pedidos semana</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {item.orders_last_week ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      <section>
        <div className="p-3 mt-6 rounded-2xl">
          <LeadsChart />
        </div>
      </section>
    </main>
  );
}
