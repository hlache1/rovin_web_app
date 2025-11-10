"use client";
import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";
import { useAddProduct } from "@/hooks/useAddProduct";

export default function AddProductForm() {
  const { addProduct, loading, error } = useAddProduct();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    stock: "0",
    availability: "",
    image_url: "",
  });

  const availability = [
    { value: "in stock", label: "Disponible" },
    { value: "out of stock", label: "Agotado" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    fieldName?: string
  ) => {
    if (typeof e === "string" && fieldName) {
      setForm((prev) => ({ ...prev, [fieldName]: e }));
    } else {
      const { name, value } = (e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target;
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, availability: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!form.availability) {
    //   alert("Debes seleccionar la disponibilidad");
    //   return;
    // }
  
    // Llamar al hook
    const resp = await addProduct({
      name: form.name,
      brand: form.brand,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      availability: form.availability as "in stock" | "out of stock",
      image_url: form.image_url || undefined,
    });
  
    if (resp) {  
      setForm({
        name: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        stock: "0",
        availability: "",
        image_url: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Description */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            Datos del producto
          </h2>
        </div>
        <div className="p-4 sm:p-6 dark:border-gray-800">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Nombre</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div>
              <Label>Marca</Label>
              <Input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Marca del producto"
                required
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Categoria del producto"
                required
              />
            </div>
            <div className="col-span-full">
              <Label>Descripción</Label>
              <TextArea
                name="description"
                value={form.description}
                onChange={(val: string) => handleChange(val, "description")}
                rows={6}
                placeholder="Descripción del producto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Availability */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            Detalles de precio y disponibilidad
          </h2>
        </div>
        <div className="space-y-5 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <Label>Precio</Label>
              <Input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Precio"
                required
              />
            </div>
            <div>
              <Label>Cantidad en stock</Label>
              <Input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="Agregar stock"
                required
              />
            </div>
            <div>
              <Label>Disponibilidad</Label>
              <Select
                options={availability}
                placeholder="Disponibilidad"
                onChange={(val: string) => handleSelectChange(val)}
                defaultValue={form.availability}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Image */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            Imagen del producto
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <Label>Imagen</Label>
          <Input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="URL"
          />
        </div>

        {/* <div className="p-4 sm:p-6">
          <label
            htmlFor="product-image"
            className="shadow-theme-xs group hover:border-brand-500 block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 transition dark:hover:border-brand-400 dark:border-gray-800"
          >
            <div className="flex justify-center p-10">
              <div className="flex max-w-[260px] flex-col items-center gap-4">
                <div className="inline-flex h-13 w-13 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition dark:border-gray-800 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20.0004 16V18.5C20.0004 19.3284 19.3288 20 18.5004 20H5.49951C4.67108 20 3.99951 19.3284 3.99951 18.5V16M12.0015 4L12.0015 16M7.37454 8.6246L11.9994 4.00269L16.6245 8.6246"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    Click to upload
                  </span>
                  or drag and drop SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
            </div>
            <input type="file" id="product-image" className="hidden" />
          </label>
        </div> */}

      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Agregando..." : "Agregar producto"}
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
