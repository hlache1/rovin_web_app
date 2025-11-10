import { createClient } from "@/lib/supabase/server";


export async function POST(req: Request) {
    try {
      const supabase = await createClient();
      const body = await req.json();
  
      const META_TOKEN = process.env.META_ACCESS_TOKEN!;
      const META_CATALOG_ID = process.env.META_CATALOG_ID!;
      const META_API_VERSION = process.env.META_API_VERSION || "v22.0";
  
      const retailerId = crypto.randomUUID();
      const form = new URLSearchParams();
  
      form.append("name", body.name);
      form.append("brand", body.brand);
      form.append("description", body.description || "");
      form.append("retailer_id", retailerId);
      form.append("condition", "new");
      form.append("price", (parseInt(body.price) * 100).toString());
      form.append("currency", "MXN");
      form.append("availability", body.availability);
  
      if (body.image_url) form.append("image_url", body.image_url);
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
          name: body.name,
          description: body.description,
          brand: body.brand,
          category: body.category,
          stock: body.stock,
          price: body.price,
          status: body.availability === "in stock" ? "Disponible" : "Agotado",
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