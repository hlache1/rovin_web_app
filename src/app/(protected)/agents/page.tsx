import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";

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

export default function AgentsPage() {
    return (
       <>
      <PageBreadcrumb pageTitle="Agentes IA" />
      <ComponentCard title="Agentes disponibles">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Link key={agent.name} href={`/agents/${agent.id}`} className="border border-gray-200 rounded-2xl p-5 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
          <div className="text-3xl mb-4">{agent.icon}</div>
          <h3 className="text-lg font-medium mb-2 dark:text-gray-100">{agent.name}</h3>
          <p className="text-gray-600 dark:text-gray-400">{agent.description}</p>
          </Link>
        ))}
        </div>
      </ComponentCard>
       </>
    );
  }
  