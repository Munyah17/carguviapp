import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/queries";
import { AdminNav } from "./nav";
import { AdminLoginCard } from "@/components/auth/admin-login-card";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // /admin IS the staff login portal — show the form in place, no redirect.
  if (!user) return <AdminLoginCard />;
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
