import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Productos");

  sheet.columns = [
    { header: "name", key: "name", width: 25 },
    { header: "brand", key: "brand", width: 20 },
    { header: "category", key: "category", width: 20 },
    { header: "description", key: "description", width: 40 },
    { header: "price", key: "price", width: 10 },
    { header: "stock", key: "stock", width: 10 },
    { header: "availability", key: "availability", width: 15 },
    { header: "image_url", key: "image_url", width: 40 },
  ];
 
  sheet.addRow({
    name: "Ejemplo Producto",
    brand: "MarcaX",
    category: "Accesorios",
    description: "Descripción ejemplo",
    price: 199,
    stock: 10,
    availability: "in stock",
    image_url: "https://ejemplo.com/img.png"
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="products_template.xlsx"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
