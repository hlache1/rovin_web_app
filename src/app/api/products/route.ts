import { createClient } from "@/lib/supabase/server";


export async function POST(req: Request) {
    try {
      const META_TOKEN = process.env.META_ACCESS_TOKEN!;
      const META_CATALOG_ID = process.env.META_CATALOG_ID!;
      const META_API_VERSION = process.env.META_API_VERSION || "v22.0";

      const supabase = await createClient();
      const formData = await req.formData();

      const name = formData.get("name") as string;
      const brand = formData.get("brand") as string;
      const category = formData.get("category") as string;
      const description = formData.get("description") as string;
      const price = Number(formData.get("price"));
      const stock = Number(formData.get("stock"));
      const availability = formData.get("availability") as string;
      const imageFile = formData.get("image_file") as File | null;
      const image_url = formData.get("image_url") as string | null;

      let uploadedImageUrl = image_url || "";
      if (imageFile) {
        const fileName = `${crypto.randomUUID()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });
  
        if (uploadError) throw new Error(uploadError.message);
  
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(uploadData.path);
  
        uploadedImageUrl = publicUrlData.publicUrl;
      }
  
      
  
      const retailerId = crypto.randomUUID();
      const form = new URLSearchParams();
  
      form.append("name", name);
      form.append("brand",brand);
      form.append("description", description || "");
      form.append("retailer_id", retailerId);
      form.append("condition", "new");
      form.append("price", ((price) * 100).toString());
      form.append("currency", "MXN");
      form.append("availability", availability);
  
      if (uploadedImageUrl) form.append("image_url", uploadedImageUrl);
      form.append("access_token", META_TOKEN);
  
      const metaResp = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${META_CATALOG_ID}/products`,
        { method: "POST", body: form },
      );
  
      const metaJson = await metaResp.json();
  
      if (!metaResp.ok || !metaJson.id) {
        console.error("Meta API error:", metaJson);
        throw new Error(metaJson.error?.message || "Error en Meta");
      }
  
      const metaId = metaJson.id;
  
      const { data, error: dbError } = await supabase
        .from("products")
        .insert({
          name: name,
          description: description,
          brand: brand,
          category: category,
          stock: stock,
          price: price,
          status: availability === "in stock" ? "Disponible" : "Agotado",
          product_retailer_id: retailerId,
        })
        .select()
        .single();
  
      if (dbError) {
        // Optional rollback:
        await fetch(
          `https://graph.facebook.com/${META_API_VERSION}/${metaId}?access_token=${META_TOKEN}`,
          { method: "DELETE" }
        );
        throw new Error(dbError.message);
      }
  
      return Response.json({ meta: { id: metaId }, local: data });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  }