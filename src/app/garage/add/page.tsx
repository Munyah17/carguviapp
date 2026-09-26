import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getVehicleMakes,
  getVehicleModels,
  getVehicleGenerations,
  getVehicleEngines,
} from "@/lib/queries";
import { VehicleForm } from "./vehicle-form";
import { addVehicle } from "../actions";

export const metadata = { title: "Add vehicle" };

export default async function AddVehiclePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/garage/add");

  const [makes, models, generations, engines] = await Promise.all([
    getVehicleMakes(),
    getVehicleModels(),
    getVehicleGenerations(),
    getVehicleEngines(),
  ]);

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-10">
      <h1 className="text-xl font-bold text-ink-900">Add a vehicle</h1>
      <p className="mt-1 text-sm text-ink-500">
        Choose your vehicle so we can match compatible parts.
      </p>
      <VehicleForm
        makes={makes}
        models={models}
        generations={generations}
        engines={engines}
        action={addVehicle}
      />
    </div>
  );
}
