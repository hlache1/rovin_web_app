import React from "react";


type Metric = {
  label: string;
  value: string | number;
};

type InvoiceMetricsProps = {
  title?: string;
  metrics: Metric[];
};

export default function InvoiceMetrics({ title = "Resumen", metrics }: InvoiceMetricsProps) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 rounded-xl border border-gray-200 sm:grid-cols-2 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-gray-800 dark:border-gray-800">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="border-b p-5 sm:border-r last:border-r-0 lg:border-b-0"
          >
            <p className="mb-1.5 text-sm text-gray-400 dark:text-gray-500">
              {metric.label}
            </p>
            <h3 className="text-3xl text-gray-800 dark:text-white/90">
              {metric.value}
            </h3>
          </div>
        ))}
      </div>
      
    </div>
  );
}
