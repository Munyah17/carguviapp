import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomerVehicles } from "@/lib/queries";
import { ButtonLink } from "@/components/ui/button";
import { IconCar, IconPlus, IconTrash } from "@/components/ui/icons";
import { removeVehicle } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Garage" };

export default async function GaragePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/garage");

  const vehicles = await getCustomerVehicles(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">My Garage</h1>
        <ButtonLink href="/garage/add" size="sm" variant="outline">
          <IconPlus className="h-4 w-4" /> Add vehicle
        </ButtonLink>
      </div>
      <p className="mt-1 text-sm text-ink-500">
        Save your vehicles to search for parts that fit.
      </p>

      {vehicles.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center">
          <IconCar className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 font-medium text-ink-700">No vehicles yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Add your car so Carguvi can show parts that fit it.
          </p>
          <ButtonLink href="/garage/add" className="mt-4">
            Add your first vehicle
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {vehicles.map((v: any) => (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <IconCar className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">
                  {v.vehicle_makes?.name} {v.vehicle_models?.name}
                  {v.year ? ` â€¢ ${v.year}` : ""}
                  {v.is_primary ? (
                    <span className="ml-2 text-xs font-medium text-brand-600">
                      Primary
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-sm text-ink-500">
                  {[v.vehicle_generations?.name, v.vehicle_engines?.name]
                    .filter(Boolean)
                    .join(" â€¢ ") || "All variants"}
                  {v.nickname ? ` â€” ${v.nickname}` : ""}
                </p>
              </div>
              <ButtonLink
                href={`/search?make_id=${v.make_id}&model_id=${v.model_id}&generation_id=${v.generation_id ?? ""}&engine_id=${v.engine_id ?? ""}`}
                variant="outline"
                size="sm"
              >
                Find parts
              </ButtonLink>
              <form
                action={async () => {
                  "use server";
                  await removeVehicle(v.id);
                }}
              >
                <button
                  className="tap rounded-lg p-2 text-ink-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove vehicle"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
