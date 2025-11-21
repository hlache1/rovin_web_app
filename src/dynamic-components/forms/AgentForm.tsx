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
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data } = await supabase
      .from("user_settings")
      .select("custom_prompt, extra_context, files",)
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPrompt(data.custom_prompt || "");
      setContext(data.extra_context || "");
      setFiles(data.files || []);
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
      files: files.length > 0 ? files : null,
    };

    const { error } = await supabase.from("user_settings").upsert(payload, { onConflict: "user_id" });

    if (error) console.error(error);
    
    alert("Configuración guardada");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadErr } = await supabase.storage
        .from("user-context-files")
        .upload(filePath, file);

      if (uploadErr) {
        console.error(uploadErr);
        continue;
      }

      const { data: publicUrl } = supabase.storage
        .from("user-context-files")
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl.publicUrl);
    }

    setFiles(prev => [...prev, ...uploadedUrls]);
  }


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

      <div className="col-span-2">
        <input
          id="file_input"
          className="p-3 block w-full text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:bg-gray-800 dark:text-gray-400 focus:outline-none dark:border-gray-600 dark:placeholder-gray-400"
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          onChange={handleFileUpload}
        />
        <p className="mt-1 ml-1 text-xs text-gray-500 dark:text-gray-300" id="file_input_help">PDF, DOC, DOCX</p>
        
        {files.length > 0 && (
          <ul className="mt-2">
            {files.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" className="text-blue-600 underline">
                  {url.split("/").pop()}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ComponentCard>
  );
}
