"use client";

import NavigationAction from "./navigtaion-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, icons, LayoutDashboard, Table, Users } from "lucide-react";
import NavigationItem from "./navigation-item";
import NavigationSubSideBar from "./navigation-sub-sidebar";

const routes = [
  { name: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  {
    id: "2",
    name: "Database",
    path: "/database",
    Icon: Database,
  },
];
const NavigationSidebar = () => {
  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {routes.map((route, index) => (
          <div key={index} className="mb-4">
            <NavigationItem
              name={route.name}
              path={route.path}
              Icon={route.Icon}
            />
            <div className="flex justify-center text-[12px]">{route.name}</div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default NavigationSidebar;
