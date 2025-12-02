"use client";

import { useParams } from "next/navigation";
import { useAgents } from "@/hooks/useAgents";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AgentChat from "@/dynamic-components/chat/AgentChat";
import AgentForm from "@/dynamic-components/forms/AgentForm";

export default function AgentsPage() {
    const params = useParams();
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

    const { agents, loading } = useAgents(id);
    if (loading) return <div>Loading...</div>;

    return (
       <>
        <PageBreadcrumb pageTitle="Agentes IA" />
        <ComponentCard 
          title={agents.find(agent => agent.id === id)?.name || ""}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <AgentForm /> 
            </div>

            <div className="md:col-span-2">
              <AgentChat />
            </div>
          </div>
        </ComponentCard>
       </>
    );
  }
  