import ExcelJS from "exceljs";
import { NextResponse } from "next/server";


const VALID_AVAILABILITY = [
  "in stock",
  "out of stock",
  "preorder",
  "available for order",
  "discontinued",
  "pending",
  "mark_as_sold",
];

const AVAILABILITY_MAP: Record<string, string> = {
  "Disponible": "in stock",
  "Agotado": "out of stock",
};

function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function validateProduct(p: any) {
  const errors: string[] = [];

  // Required
  if (!p.name) errors.push("Falta el campo requerido: name");
  if (!p.brand) errors.push("Falta el campo requerido: brand");
  if (!p.category) errors.push("Falta el campo requerido: category");
  if (p.price === "" || p.price === null || isNaN(p.price))
    errors.push("El precio debe ser un número válido");
  if (p.price <= 0) errors.push("El precio debe ser mayor a 0");
  if (p.stock === "" || p.stock === null || isNaN(p.stock))
    errors.push("El stock debe ser un número válido");
  if (p.stock < 0) errors.push("El stock no puede ser negativo");

  // Availability
  if (!VALID_AVAILABILITY.includes(p.availability)) {
    errors.push(`availability inválida: ${p.availability}`);
  }

  // URL
  if (p.image_url && !isValidUrl(p.image_url)) {
    errors.push(`image_url inválida: ${p.image_url}`);
  }

  return errors;
}


function extractCellValue(cell: any) {
  if (!cell) return "";
  if (typeof cell === "string") return cell.trim();
  if (typeof cell === "number") return cell;
  if (cell.richText) {
    return cell.richText.map((t: any) => t.text).join("").trim();
  }
  if (cell.text && typeof cell.text === "string") {
    return cell.text.trim();
  }
  if (cell.hyperlink) {
    return cell.hyperlink.trim();
  }
  
  return "";
}
  



export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file was found");

    const buffer: any = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.getWorksheet(1);
    if (!sheet) throw new Error("No worksheet found");

    const errors: any[] = [];
    let count = 0;

    for (let i = 2; i <= sheet.actualRowCount; i++) {
      const row = sheet.getRow(i);

      const product = {
        name: extractCellValue(row.getCell(1).value),
        brand: extractCellValue(row.getCell(2).value),
        category: extractCellValue(row.getCell(3).value),
        description: extractCellValue(row.getCell(4).value),
        price: Number(row.getCell(5).value),
        stock: Number(row.getCell(6).value),
        availability: extractCellValue(row.getCell(7).value),
        image_url: extractCellValue(row.getCell(8).value),
      };

      const p: Record<string, any> = product;
      Object.keys(p).forEach((k) => {
        if (typeof p[k] === "string") {
          p[k] = p[k].trim();
        }
      });

      // Avoid empty rows
      if (Object.values(product).every((v) => v === "" || v === null)) continue;

      if (AVAILABILITY_MAP[product.availability]) {
        product.availability = AVAILABILITY_MAP[product.availability];
      }

      const validationErrors = validateProduct(product);
      if (validationErrors.length > 0) {
        errors.push({ row: i, error: validationErrors });
        continue; 
      }

      const fd = new FormData();
      Object.entries(product).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          fd.append(k, v as any);
        }
      });

      const resp = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products`, {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        errors.push({ row: i, error: (await resp.json()).error });
        continue;
      }

      count++;
    }

    return NextResponse.json({ count, errors });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
