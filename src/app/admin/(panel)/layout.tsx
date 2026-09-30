import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/queries";
import { AdminNav } from "./nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const roles = await getUserRoles(user.id);
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  if (!isAdmin) redirect("/");

  return (
    <div>
      <AdminNav isSuper={roles.includes("super_admin")} />
      {children}
    </div>
  );
}
