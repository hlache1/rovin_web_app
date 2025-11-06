import { useState } from "react";

export function useAddProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = async (productData: any) => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const json = await resp.json();

      if (!resp.ok) {
        throw new Error(json.error || "Error al crear producto");
      }

      return json;
    } catch (err: any) {
      console.error("Error adding product:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addProduct, loading, error };
}
