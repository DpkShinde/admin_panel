"use client";
import { useState } from "react";
import { Database, Users, Moon, Sun, Search, Bell, BadgeCheck, UserCheck2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Sample data for users
  const totalUsers = 12843;
  const activeUsers = 5264;
  const newUsersToday = 127;
  const totalSubscriptions=100;
  const totalEmp=8;

  return (
    <div
      className={`h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Top Navigation */}
      <header
        className={`flex items-center justify-between p-4 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b shadow-sm`}
      >
        <div className="flex items-center">
          <div className="bg-green-600 rounded-full p-2 mr-3">
            <Users size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className={`pl-9 pr-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-200"
              } border`}
            />
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Bell size={20} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center">
            <span className="font-bold text-white">A</span>
          </div>
        </div>
      </header>

      {/* Main Actions */}
      <div
        className={`p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } border-b shadow-sm`}
      >
        <div className="flex flex-wrap gap-4">
          <button
            className="flex cursor-pointer items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
            onClick={() => {
              router.push(`/super-admin/database`);
            }}
          >
            <Database size={20} className="mr-2" />
            <span>Manage Database</span>
          </button>
          <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
            <Users size={20} className="mr-2" />
            <span>Manage Employees</span>
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <main className="flex-1 p-6">
        {/* User Stats Cards */}
        <h2 className="text-xl font-semibold mb-4">Website Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div
            className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-sm flex items-center`}
          >
            <div className="bg-green-100 rounded-full p-4 mr-4">
              <Users size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Users</h3>
              <p className="text-3xl font-bold">
                {totalUsers.toLocaleString()}
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-sm flex items-center`}
          >
            <div className="bg-blue-100 rounded-full p-4 mr-4">
              <Users size={28} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Active Users</h3>
              <p className="text-3xl font-bold">
                {activeUsers.toLocaleString()}
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-sm flex items-center`}
          >
            <div className="bg-purple-100 rounded-full p-4 mr-4">
              <Users size={28} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">New Users Today</h3>
              <p className="text-3xl font-bold">
                {newUsersToday.toLocaleString()}
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-sm flex items-center`}
          >
            <div className="bg-yellow-200 rounded-full p-4 mr-4">
              <BadgeCheck size={28} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Subscriptions</h3>
              <p className="text-3xl font-bold">
                {totalSubscriptions.toLocaleString()}
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-sm flex items-center`}
          >
            <div className="bg-yellow-200 rounded-full p-4 mr-4">
              <UserCheck2 size={28} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Employees</h3>
              <p className="text-3xl font-bold">
                {totalEmp.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div
          className={`rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-sm overflow-hidden`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Users</h3>
            <button className="text-blue-500 text-sm">View All Users</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-200"
                  } border-b`}
                >
                  <th className="text-left py-3 px-4 font-medium">User ID</th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Registration Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className="py-3 px-4">#12345</td>
                  <td className="py-3 px-4">John Smith</td>
                  <td className="py-3 px-4">john.smith@example.com</td>
                  <td className="py-3 px-4">23 Apr, 2025</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  </td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className="py-3 px-4">#12344</td>
                  <td className="py-3 px-4">Sarah Johnson</td>
                  <td className="py-3 px-4">sarah.j@example.com</td>
                  <td className="py-3 px-4">23 Apr, 2025</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  </td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className="py-3 px-4">#12343</td>
                  <td className="py-3 px-4">Robert Williams</td>
                  <td className="py-3 px-4">robert.w@example.com</td>
                  <td className="py-3 px-4">22 Apr, 2025</td>
                  <td className="py-3 px-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <td className="py-3 px-4">#12342</td>
                  <td className="py-3 px-4">Lisa Brown</td>
                  <td className="py-3 px-4">lisa.b@example.com</td>
                  <td className="py-3 px-4">22 Apr, 2025</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">#12341</td>
                  <td className="py-3 px-4">Michael Chen</td>
                  <td className="py-3 px-4">michael.c@example.com</td>
                  <td className="py-3 px-4">21 Apr, 2025</td>
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      Inactive
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 flex justify-between items-center border-t">
            <span className="text-sm text-gray-500">
              Showing 5 of 12,843 users
            </span>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                Previous
              </button>
              <button className="px-3 py-1 rounded bg-green-600 text-white">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
