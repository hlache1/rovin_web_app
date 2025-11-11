"use client";

import React, { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { usePromotions } from "@/hooks/usePromotions";
import { useCreatePromotion } from "@/hooks/useCreatePromotion";

import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";

import Button from "@/components/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";


export default function PromotionsPage() {
  const [currentPagePromos, setCurrentPagePromos] = useState(1);
  const [rowsPerPagePromos, setRowsPerPagePromos] = useState(5);
  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const [rowsPerPageProducts, setRowsPerPageProducts] = useState(50);

  const [promoName, setPromoName] = useState("");
  const [promoDescription, setPromoDescription] = useState("");
  const [promoType, setPromoType] = useState("");
  const [rewardValue, setRewardValue] = useState<number | null>(null);
  const [conditions, setConditions] = useState<any[]>([]);

  const [conditionTypeSelected, setConditionTypeSelected] = useState("");
  const [conditionInputValue, setConditionInputValue] = useState("");
  const [endDate, setEndDate] = useState("");

  const { 
    promotions, 
    total: totalPromos, 
    loading: loadingPromos 
  } = usePromotions(
    currentPagePromos, rowsPerPagePromos
  );
  const totalPagesPromos = Math.ceil(totalPromos / rowsPerPagePromos);

  const {
    products, 
    total: totalProducts, 
    loading: loadingProducts 
  } = useProducts(
    currentPageProducts, rowsPerPageProducts, ""
  );
  const totalPagesProducts = Math.ceil(totalProducts / rowsPerPageProducts);

  const { createPromotion, loading: savingPromo } = useCreatePromotion();

  function addCondition({ type, value, label }) {
    setConditions((prev) => [
      ...prev,
      {
        condition_type: type,
        condition_value: value,
        label: label,
      },
    ]);
  }

  function removeCondition(index: number) {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSavePromotion() {
    const result = await createPromotion({
      name: promoName,
      description: promoDescription,
      promoType,
      rewardValue: rewardValue ?? 0,
      conditions: conditions.map((c) => ({
        condition_type: c.condition_type,
        condition_value: c.condition_value,
      })),
      endDate: endDate,
    });

    if (result.success) {
      alert("✅ Promoción creada correctamente");
      resetForm();
    } else {
      alert("❌ Error creando promoción");
    }
  }

  function resetForm() {
    setPromoName("");
    setPromoDescription("");
    setPromoType("");
    setRewardValue(null);
    setConditions([]);
  }

  const handleTextAreaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    fieldName?: string
  ) => {
    if (typeof e === "string" && fieldName) {
      setPromoDescription(e);
    } else {
      const { name, value } = (e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>).target;
      setPromoDescription(value);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Promociones" />

      <ComponentCard title="Promociones">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Columna izquierda */}
          <div className="border rounded-lg min-h-[300px] p-5 space-y-5"
          >
            <h2 className="text-lg font-semibold bb-3 dark:text-gray-300">Crear promoción</h2>

            <div className="space-y-3">

              {/* Nombre */}
              <div>
                <Label>Nombre</Label>
                <Input
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                />
              </div>

              {/* Descripción */}
              <div>
                <Label>Descripción</Label>
                <TextArea
                  className="w-full border rounded px-3 py-2"
                  value={promoDescription}
                  placeholder="Descripción de la promoción"
                  onChange={(val: string) => handleTextAreaChange(val, "description")}
                  // onChange={(e) => setPromoDescription(e.target.value)}
                />
              </div>

              {/* Tipo de promoción */}
              <div>
                <Label>Tipo de promoción</Label>
                <Select
                  className="w-full border rounded px-3 py-2"
                  value={promoType}
                  onChange={(e) => setPromoType(e)}
                  placeholder="Selecciona..."
                  options={
                    [
                      { value: "", label: "Selecciona..." },
                      { value: "bundle", label: "Combo / Bundle" },
                      { value: "percentage", label: "Descuento %" },
                      { value: "quantity", label: "Descuento por cantidad" },
                      { value: "cart", label: "Total del carrito" },
                    ]
                  }
                >
                </Select>
              </div>

              {/* Valor recompensa */}
              {promoType && (
                <div>
                  <Label>
                    Valor de la promoción ({
                      promoType === "bundle"
                        ? "Precio del combo"
                        : promoType === "percentage"
                        ? "Porcentaje de descuento"
                        : promoType === "quantity"
                        ? "Cantidad mínima"
                        : promoType === "cart"
                        ? "Porcentaje de descuento"
                        : ""
                    })
                  </Label>
                  <Input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={rewardValue ?? ""}
                    onChange={(e) => setRewardValue(Number(e.target.value))}
                  />
                </div>
              )}

              {/* Tipo de condición */}
              <div>
                <Label>Agregar condición</Label>

                <Select
                  defaultValue={conditionTypeSelected}
                  onChange={(v) => {
                    setConditionTypeSelected(v);
                    setConditionInputValue("");
                  }}
                  options={[
                    { value: "", label: "Selecciona condición..." },
                    { value: "product", label: "Producto específico" },
                    { value: "category", label: "Categoría" },
                    { value: "brand", label: "Marca" },
                    { value: "min_quantity", label: "Cantidad mínima" },
                    { value: "min_total", label: "Total mínimo de compra" },
                  ]}
                />
              </div>

              {/* Input según tipo de condición */}
              {conditionTypeSelected === "product" && (
                <div className="mt-2">
                  <Label>Selecciona un producto</Label>
                  <Select
                    placeholder="Elige producto..."
                    options={products.map((p: any) => ({
                      value: p.id,
                      label: `${p.name} – $${p.price}`,
                    }))}
                    onChange={(id) => {
                      const product = products.find((p: any) => p.id === id);
                      if (product) {
                        addCondition({
                          type: "product",
                          value: product.product_retailer_id,
                          label: product.name,
                        });
                      }
                    }}
                  />
                </div>
              )}

              {conditionTypeSelected === "category" && (
                <div className="mt-2">
                  <Label>Categoría</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Ej. Electrónica"
                      value={conditionInputValue}
                      onChange={(e) => setConditionInputValue(e.target.value)}
                    />
                  
                    <Button
                      variant="outline" size="sm"
                      onClick={() => {
                        if (!conditionInputValue) return;
                        addCondition({
                          type: "category",
                          value: conditionInputValue,
                          label: conditionInputValue,
                        });
                        setConditionInputValue("");
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              )}

              {conditionTypeSelected === "brand" && (
                <div className="mt-2">
                  <Label>Marca</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Ej. Nike"
                      value={conditionInputValue}
                      onChange={(e) => setConditionInputValue(e.target.value)}
                    />

                    <Button
                      variant="outline" size="sm"
                      onClick={() => {
                        if (!conditionInputValue) return;
                        addCondition({
                          type: "brand",
                          value: conditionInputValue,
                          label: conditionInputValue,
                        });
                        setConditionInputValue("");
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              )}

              {conditionTypeSelected === "min_quantity" && (
                <div className="mt-2">
                  <Label>Cantidad mínima</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={conditionInputValue}
                      onChange={(e) => setConditionInputValue(e.target.value)}
                    />

                    <Button
                      variant="outline" size="sm"
                      onClick={() => {
                        if (!conditionInputValue) return;
                        addCondition({
                          type: "min_quantity",
                          value: conditionInputValue,
                          label: `${conditionInputValue} unidades`,
                        });
                        setConditionInputValue("");
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              )}


              {conditionTypeSelected === "min_total" && (
                <div className="mt-2">
                  <Label>Total mínimo ($)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={conditionInputValue}
                      onChange={(e) => setConditionInputValue(e.target.value)}
                    />

                    <Button
                      variant="outline" size="sm"
                      onClick={() => {
                        if (!conditionInputValue) return;
                        addCondition({
                          type: "min_total",
                          value: conditionInputValue,
                          label: `$${conditionInputValue}`,
                        });
                        setConditionInputValue("");
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <Label>Fecha de expiración</Label>
                <Input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>


              {/* Lista de condiciones agregadas */}
              {conditions.length > 0 && (
                <div className="mt-3">
                  <Label>
                    Productos/Condiciones en la promoción ({conditions.length})
                  </Label>

                  <ul className="space-y-2 mt-2">
                    {conditions.map((c, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <span>
                          {c.condition_type.toUpperCase()} → {c.label}
                        </span>
                        <button
                          className="text-red-500 text-sm"
                          onClick={() => removeCondition(index)}
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guardar */}
              <button
                onClick={handleSavePromotion}
                disabled={savingPromo}
                className="w-full bg-blue-600 text-white py-2 rounded mt-4"
              >
                {savingPromo ? "Guardando..." : "Crear promoción"}
              </button>
            </div>
          
          </div>

          {/* Columna derecha: lista de promociones */}
          <div className="space-y-4">
            <h1 className="dark:text-gray-200">Promociones disponibles</h1>
            {loadingPromos && (
              <p className="text-gray-500 dark:text-gray-200">Cargando promociones...</p>
            )}

            {!loadingPromos && promotions.length === 0 && (
              <p className="text-gray-500 dark:text-gray-200">No hay promociones registradas.</p>
            )}

            {/* Render de promociones */}
            {!loadingPromos &&
              promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="border p-4 rounded-lg shadow-sm hover:shadow transition"
                >
                  <h3 className="font-semibold text-lg dark:text-gray-300">{promo.name}</h3>

                  <p className="text-sm text-gray-600">
                    {promo.description || "Sin descripción"}
                  </p>

                  <div className="mt-2 text-xs text-gray-500">
                    Vigencia:{" "}
                    {new Date(promo.start_date).toLocaleDateString()} —{" "}
                    {new Date(promo.end_date).toLocaleDateString()}
                  </div>

                  <div className="mt-1 text-sm font-medium dark:text-gray-400">
                    Tipo: {
                      promo.discount_type === "bundle"
                        ? "Combo / Bundle"
                        : promo.discount_type === "percentage"
                        ? "Descuento %"
                        : promo.discount_type === "quantity"
                        ? "Descuento por cantidad"
                        : promo.discount_type === "cart"
                        ? "Total del carrito"
                        : promo.discount_type
                    }
                  </div>
                </div>
              ))}

            {/* PAGINACIÓN */}
            {totalPagesPromos > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  disabled={currentPagePromos === 1}
                  onClick={() => setCurrentPagePromos((p) => p - 1)}
                  className={`px-4 py-2 rounded border ${
                    currentPagePromos === 1
                      ? "text-gray-400 border-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Anterior
                </button>

                <span className="text-sm text-gray-600">
                  Página {currentPagePromos} de {totalPagesPromos}
                </span>

                <button
                  disabled={currentPagePromos === totalPagesPromos}
                  onClick={() => setCurrentPagePromos((p) => p + 1)}
                  className={`px-4 py-2 rounded border ${
                    currentPagePromos === totalPagesPromos
                      ? "text-gray-400 border-gray-300 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </ComponentCard>
    </>
  );
}