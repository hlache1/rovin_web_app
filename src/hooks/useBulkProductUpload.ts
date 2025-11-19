import { useState } from "react";

export function useBulkProductUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadExcel = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      const form = new FormData();
      form.append("file", file);

      const resp = await fetch("/api/products/bulk", {
        method: "POST",
        body: form,
      });

      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json.error);
      }

      return json;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadExcel, loading, error };
}
