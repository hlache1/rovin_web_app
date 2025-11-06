"use client"

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import LeadsChart from "@/dynamic-components/charts/LeadsChart";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { useLeadsStats } from "@/hooks/useLeadsStats";

export default function DashboardPage() {
  const { stats, loading } = useLeadsStats();

  if (loading) return <p>Loading...</p>;

  const pluralStatusMap: Record<string, string> = {
    "Lead generado": "Leads generados",
    "Lead inactivo": "Leads inactivos",
    "Lead activo": "Leads activos",
    "Lead ganado": "Leads ganados"
  };

  return (
    <main className="">
      <section className="grid p-3 rounded-2xl">
        <h1 className="text-xl font-medium mb-3 dark:text-gray-300">
          Datos de tus leads
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {stats.map((item) => {
            const growth =
              item.previous_count === 0
                ? 100
                : ((item.current_count - item.previous_count) /
                    item.previous_count) *
                  100;

            return (
              <div key={item.status} className="col-span-1">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                  <div className="flex items-center justify-start bg-none">
                    <span className="text-2xl">
                        {item.status === "Lead generado" && "🆕"}
                        {item.status === "Lead inactivo" && "❄️"}
                        {item.status === "Lead activo" && "🔥"}
                        {item.status === "Lead ganado" && "👤"} 
                    </span>
                  </div>

                  <div className="flex items-end justify-between mt-4 overflow-hidden">
                    <div className="min-w-0">
                    <span className="text-md text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {pluralStatusMap[item.status] ?? item.status}
                    </span>
                      <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {item.current_count}
                      </h4>
                    </div>
                    <Badge color={growth >= 0 ? "success" : "error"}>
                      {growth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                      {growth.toFixed(2)}%
                    </Badge>
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
