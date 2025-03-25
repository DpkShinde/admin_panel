"use client";

import NavigationAction from "./navigtaion-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, LayoutDashboard } from "lucide-react";
import NavigationItem from "./navigation-item";

const routes = [
  { name: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { id: "2", name: "Database", path: "/database", Icon: Database },
];

const NavigationSidebar = () => {
  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-green-900 bg-green-100 py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-green-300 dark:bg-green-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {routes.map((route, index) => (
          <div key={index} className="mb-4">
            <NavigationItem
              name={route.name}
              path={route.path}
              Icon={route.Icon}
            />
            <div className="flex justify-center text-[12px] text-green-700 dark:text-green-300">
              {route.name}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default NavigationSidebar;
