import NavigationSidebar from "@/layouts/navigation/navigation-sidebar"
import NavigationSubSideBar from "@/layouts/navigation/navigation-sub-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <div className="h-full">
        <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
            <NavigationSidebar />
        </div>

        <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
            <NavigationSubSideBar />
        </div>
        <main className="md:pl-[170px] h-full textbl ml-28">
            {children}
        </main>
    </div>
}