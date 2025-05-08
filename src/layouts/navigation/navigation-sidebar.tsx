"use client";

import NavigationAction from "./navigtaion-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, LayoutDashboard, LogOut, LogOutIcon } from "lucide-react";
import NavigationItem from "./navigation-item";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/action-tooltip";

const routes = [
  { name: "Dashboard", path: "/super-admin/dashboard", Icon: LayoutDashboard },
  { id: "2", name: "Database", path: "/super-admin/database", Icon: Database },
];

const NavigationSidebar = () => {
  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-green-900 bg-green-900 py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-green-300 dark:bg-green-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {routes.map((route, index) => (
          <div key={index} className="mb-4 text-white">
            <NavigationItem
              name={route.name}
              path={route.path}
              Icon={route.Icon}
            />
            <div className="flex justify-center text-[12px] text-green-100 dark:text-green-300">
              {route.name}
            </div>
          </div>
        ))}
      </ScrollArea>
      {/* Logout Button */}
      <div className="mt-auto pb-3 w-full px-3">
        <ActionTooltip side="right" align="center" label="Logout">
          <Button
            onClick={() => signOut({ callbackUrl: "/super-admin/login" })}
            className="bg-red-700 text-white w-full hover:bg-red-600 transition dark:bg-red-800 dark:hover:bg-red-700"
            variant="destructive"
          >
            <LogOutIcon className="h-4 w-4 mr-2" />
          </Button>
        </ActionTooltip>
      </div>
    </div>
  );
};

export default NavigationSidebar;
