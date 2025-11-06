"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import ComponentCard from "@/components/common/ComponentCard";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
// import { PaperPlaneIcon } from "@/icons";

export default function AgentForm() {
  const [prompt, setPrompt] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data } = await supabase
      .from("user_settings")
      .select("custom_prompt, extra_context")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPrompt(data.custom_prompt || "");
      setContext(data.extra_context || "");
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const payload = {
      user_id: user.id,
      custom_prompt: prompt || null,
      extra_context: context || null,
    };

    const { error } = await supabase.from("user_settings").upsert(payload, { onConflict: "user_id" });

    if (error) console.error(error);
    
    alert("Configuración guardada");
  };

  if (loading) return <p className="p-4">Cargando...</p>;

  const handlePromptChange = (value: string) => {
    setPrompt(value);
  };

  const handleContextChange = (value: string) => {
    setContext(value);
  };

  return (
    <ComponentCard title="Personalizar agente">
      <Form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
           <div className="col-span-2">
            <Label htmlFor="subject">Instrucciones adicionales</Label>
            <TextArea
              placeholder="Type your message here..."
              rows={6}
              value={prompt}
              onChange={handlePromptChange}
              className=" bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="subject">Contexto adicional</Label>
            <TextArea
              placeholder="Type your message here..."
              rows={6}
              value={context}
              onChange={handleContextChange}
              className=" bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="col-span-2">
            <Button size="sm" className="w-full" type="submit">
              Guardar
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
}
