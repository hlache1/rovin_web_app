"use client";

import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AgentChat from "@/dynamic-components/chat/AgentChat";
import AgentForm from "@/dynamic-components/forms/AgentForm";
import Button from "@/components/ui/button/Button";
import { PaperPlaneIcon } from "@/icons";

export default function AgentsPage() {
    // const router = useRouter();
    const params = useParams();
    const id = params.id;

    const agents = [
      {
        id: 1,
        icon: "🤖", 
        name: "Asistente de ventas", 
        description: "Ayuda a los usuarios a generar pedidos y resolver dudas de productos"
      },
      {
        id: 2,
        icon: "🧑‍💼", 
        name: "Asistente de recursos humanos", 
        description: "Responde preguntas sobre políticas de la empresa y beneficios para empleados"
      },
      { 
        id: 3,
        icon: "💬", 
        name: "Asistente de atención al cliente", 
        description: "Proporciona soporte a los clientes respondiendo preguntas frecuentes y resolviendo problemas comunes"
      },
    ]

    return (
       <>
        <PageBreadcrumb pageTitle="Agentes IA" />
        <ComponentCard 
          title={agents.find(agent => agent.id === Number(id))?.name || ""}>
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
  