"use client";

import { useAgents } from "@/hooks/useAgents";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";


export default function AgentsPage() {
    const { agents, loading } = useAgents();

    if (loading) return <div>Loading...</div>;

    return (
       <>
      <PageBreadcrumb pageTitle="Agentes IA" />
      <ComponentCard title="Agentes disponibles">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Link key={agent.name} href={`/agents/${agent.id}`} className="border border-gray-200 rounded-2xl p-5 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
          {/* <div className="text-3xl mb-4">{agent.icon}</div> */}
          <h3 className="text-lg font-medium mb-2 dark:text-gray-100">{agent.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{agent.description}</p>
          </Link>
        ))}
        </div>
      </ComponentCard>
       </>
    );
  }
  