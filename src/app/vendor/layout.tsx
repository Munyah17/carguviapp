import { VendorNav } from "./nav";

export default function VendorLayout({ children }: LayoutProps<"/vendor">) {
  return (
    <div>
      <VendorNav />
      {children}
    </div>
  );
}
