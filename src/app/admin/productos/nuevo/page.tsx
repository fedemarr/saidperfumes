import { ProductForm } from "@/components/admin/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
