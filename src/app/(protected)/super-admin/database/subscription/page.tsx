"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, User } from "lucide-react";
import Link from "next/link";

const subscriptionActions = [
  {
    name: "Manage Subscriptions",
    icon: <Table className="w-6 h-6 text-gray-700" />,
    path: "/super-admin/database/subscription/subscription-management",
    description: "View and manage all user subscription records.",
  },
  {
    name: "Assign Subscription to User",
    icon: <User className="w-6 h-6 text-gray-700" />,
    path: "/super-admin/database/subscription/subscription-assign/add",
    description: "Assign a subscription plan to a specific user.",
  },
];

export default function SubscriptionHome() {
  return (
    <div className="p-6 ml-5">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Subscription Management Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 cursor-pointer">
        {subscriptionActions.map((action, index) => (
          <Link href={action.path} key={index} className="cursor-pointer">
            <Card className="bg-white shadow-xl border border-gray-200 rounded-2xl transition-transform transform hover:scale-105">
              <CardHeader className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  {action.icon}
                </div>
                <CardTitle className="text-gray-900">{action.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
