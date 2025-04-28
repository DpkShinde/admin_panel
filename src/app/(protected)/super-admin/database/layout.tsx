import NavigationSidebar from "@/layouts/navigation/navigation-sidebar";
import NavigationSubSideBar from "@/layouts/navigation/navigation-sub-sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <Toaster position="bottom-right"/>

      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>

      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <NavigationSubSideBar />
      </div>
      <main className="md:pl-[250px] h-full textbl ml-18 p-5 text-black">
        {children}
      </main>
    </div>
  );
}
