"use client";
import React from "react";

import { ApexOptions } from "apexcharts";
import { useContactsByMonth } from "@/hooks/useLeadsYearStats";
import { LEAD_STATUSES } from "@/utils/statuses";

import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});


export default function LeadsChart() {
  const { data, loading } = useContactsByMonth();

  if (loading) return <p>Cargando...</p>;

  const statuses = LEAD_STATUSES.map(s => ({
    key: s.key,
    label: s.label,
  }));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const series = statuses.map((status) => ({
    name: status.label,
    data: months.map((month) => {
      const record = data.find((d) => d.status === status.key && d.month === month);
      return record ? record.count : 0;
    }),
  }));

  const options: ApexOptions = {
    colors: [
      "#3152F5", 
      // "#3C4857",
      "#F04E3D",
      "#DDFDFE",  
    ],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    chart: { 
      fontFamily: "Outfit, sans-serif",
      height: 310,
      width: "100%",
      type: "line" ,
      toolbar: { show: false }
    },
    stroke: {
      curve: "smooth",
      width: [2, 2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff", 
      strokeWidth: 2,
      hover: {
        size: 6,
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM yyyy" },
    },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    }
  }

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartEight" className="min-w-[1000px] xl:min-w-full">
        <ReactApexChart
          // options={options}
          options={options}
          series={series}
          type="area"
          height={310}
        />
      </div>
    </div>
  );
}
