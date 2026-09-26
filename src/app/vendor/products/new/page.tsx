import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getVendorForUser,
  getVehicleMakes,
  getVehicleModels,
  getVehicleGenerations,
  getVehicleEngines,
} from "@/lib/queries";
import { ProductForm } from "../product-form";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const info = await getVendorForUser(user.id);
  if (!info?.vendor) redirect("/vendor/apply");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  const [makes, models, generations, engines] = await Promise.all([
    getVehicleMakes(),
    getVehicleModels(),
    getVehicleGenerations(),
    getVehicleEngines(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Add product</h1>
      <ProductForm
        categories={categories ?? []}
        makes={makes}
        models={models}
        generations={generations}
        engines={engines}
      />
    </div>
  );
}
