"use client";
import React, { useState, useEffect } from "react";
import { CheckLineIcon } from "../../icons";
import { supabase } from "@/lib/supabase/client";

const starterPack = [
  "100 creditos al mes",
  "1 plantilla de agente",
  "Soporte básico por email",
];
const mediumPack = [
  "500 creditos al mes",
  "3 plantillas de agentes",
  "Soporte prioritario por email",
];
const largePack = [
  "1200 creditos al mes",
  "10 plantillas de agentes",
  "Soporte 24/7 por email y chat",
];

const planPrices: Record<string, { monthly: string; annual: string }> = {
  basic: { monthly: "49.00", annual: "500.00" },
  medium: { monthly: "99.00", annual: "1000.00" },
  pro: { monthly: "149.00", annual: "1500.00" },
}

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function PriceTableOne() {
  const [isMonthly, setIsMonthly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users_mirror")
        .select("plan")
        .eq("id", user.id)
        .single();

      setUserPlan(profile?.plan?.trim().toLowerCase() ?? null);
    }

    fetchUserPlan();
  }, []);

  async function handleCheckout(plan: string) {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, isMonthly, userId: user?.id }),
    });
    const data = await res.json();
    // const stripe = await stripePromise;
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="text-gray-500 dark:text-gray-400">Cargando...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto w-full max-w-[385px]">
        <h2 className="font-bold text-center text-gray-800 mb-7 text-title-sm dark:text-white/90">
          Planes de pago disponibles
        </h2>
      </div>
      <div>
        <div className="mb-10 text-center">
          <div className="relative inline-flex p-1 mx-auto bg-gray-200 rounded-full z-1 dark:bg-gray-800">
            <span
              className={`absolute top-1/2 -z-1 flex h-11 w-[120px] -translate-y-1/2 rounded-full bg-white shadow-theme-xs duration-200 ease-linear dark:bg-white/10 ${
                isMonthly ? "translate-x-0" : "translate-x-full"
              }`}
            ></span>
            <button
              onClick={() => setIsMonthly(true)}
              className={`flex h-11 w-[120px] items-center justify-center text-base font-medium ${
                isMonthly
                  ? "text-gray-800 dark:text-white/90"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-white/70 dark:text-gray-400"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsMonthly(false)}
              className={`flex h-11 w-[120px] items-center justify-center text-base font-medium ${
                !isMonthly
                  ? "text-gray-800 dark:text-white/90"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-white/80 dark:text-gray-400"
              }`}
            >
              Anual
            </button>
          </div>
        </div>

        <div className="grid gap-5 gird-cols-1 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {/* <!-- Pricing item --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="block mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
              Básico
            </span>

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-end">
                <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90">
                  ${isMonthly ? planPrices["basic"].monthly : planPrices["basic"].annual}
                </h2>

                <span className="inline-block mb-1 text-sm text-gray-500 dark:text-gray-400">
                  {isMonthly ? "/mes" : "/año"}
                </span>
              </div>
              {/* <span className="font-semibold text-gray-400 line-through text-theme-xl">
                ${isMonthly ? "12.00" : "150.00"}
              </span> */}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Para uso personal y proyectos pequeños
            </p>

            <div className="w-full h-px my-6 bg-gray-200 dark:bg-gray-800"></div>

            <ul className="mb-8 space-y-3">
              {starterPack.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
                >
                  <CheckLineIcon className="text-success-500" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              disabled={!!userPlan && userPlan !== "basic"}
              onClick={() => {
                if (userPlan === "basic") {
                  // lógica de cancelar después
                  return
                } else {
                  handleCheckout("basic");
                }
              }} 
              className="flex w-full items-center justify-center rounded-lg bg-gray-800 p-3.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-500 dark:bg-white/10 dark:hover:bg-brand-600 disabled:pointer-events-none">
              {userPlan === "basic"
              ? "Cancelar plan"
              : userPlan
              ? "Plan activo"
              : "Elegir plan"}
            </button>
          </div>

          {/* <!-- Pricing item --> */}
          <div className="p-6 bg-gray-800 border border-gray-800 rounded-2xl dark:border-white/10 dark:bg-white/10">
            <span className="block mb-3 font-semibold text-white text-theme-xl">
              Intermedio
            </span>

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-end">
                <h2 className="font-bold text-white text-title-md">
                  ${isMonthly ? planPrices["medium"].monthly : planPrices["medium"].annual}
                </h2>

                <span className="inline-block mb-1 text-sm text-white/70">
                  {isMonthly ? "/mes" : "/año"}
                </span>
              </div>

              {/* <span className="font-semibold text-gray-300 line-through text-theme-xl">
                ${isMonthly ? "30.00" : "250.00"}
              </span> */}
            </div>

            <p className="text-sm text-white/70">
              Para pequeñas y medianas empresas
            </p>

            <div className="w-full h-px my-6 bg-white/20"></div>

            <div className="mb-8 space-y-3">
              {mediumPack.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm text-white/80"
                >
                  <CheckLineIcon className="text-success-500" />
                  {item}
                </li>
              ))}
            </div>
            <button
              disabled={!!userPlan && userPlan !== "medium"}
              onClick={() => {
                if (userPlan === "medium") {
                  // lógica de cancelar después
                  return
                } else {
                  handleCheckout("medium");
                }
              }} 
              className="flex w-full items-center justify-center rounded-lg bg-brand-500 p-3.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 dark:hover:bg-brand-600 disabled:pointer-events-none">
             {userPlan === "medium"
              ? "Cancelar plan"
              : userPlan
              ? "Plan activo"
              : "Elegir plan"}
            </button>
          </div>

          {/* <!-- Pricing item --> */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="block mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
              Pro
            </span>

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-end">
                <h2 className="font-bold text-gray-800 text-title-md dark:text-white/90">
                  ${isMonthly ? planPrices["pro"].monthly : planPrices["pro"].annual}
                </h2>
                <span className="inline-block mb-1 text-sm text-gray-500 dark:text-gray-400">
                  {isMonthly ? "/mes" : "/año"}
                </span>
              </div>
              {/* <span className="font-semibold text-gray-400 line-through text-theme-xl">
                ${isMonthly ? "59.00" : "350.00"}
              </span> */}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Para empresas y proyectos grandes
            </p>

            <div className="w-full h-px my-6 bg-gray-200 dark:bg-gray-800"></div>

            <ul className="mb-8 space-y-3">
              {largePack.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
                >
                  <CheckLineIcon className="text-success-500" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              disabled={!!userPlan && userPlan !== "pro"}
              onClick={() => {
                if (userPlan === "pro") {
                  // lógica de cancelar después
                  return
                } else {
                  handleCheckout("pro");
                }
              }}  
              className="flex w-full items-center justify-center rounded-lg bg-gray-800 p-3.5 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-500 dark:bg-white/10 dark:hover:bg-brand-600 disabled:pointer-events-none">
             {userPlan === "pro"
              ? "Cancelar plan"
              : userPlan
              ? "Plan activo"
              : "Elegir plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
