'use client';
import React, { useEffect, useState } from 'react';

const UsersPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<Record<string, any>>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      getUsers();
    }
  }, [mounted]);

  const getUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/get", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      console.log("Fetched users:", data);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!mounted) return null; // Prevents hydration mismatch

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Users Page</h1>

      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white border border-gray-200 shadow-lg">
          <thead className="bg-[#2B2D31] text-white">
            <tr>
              {[
                "User ID", "Username", "First Name", "Last Name", "Email",
                "Phone", "Gender", "DOB", "Age", "Country", "State",
                "City", "Pincode", "Occupation", "Industry", "Income",
                "Address", "Created", "Updated"
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-sm font-semibold border border-gray-300 text-center w-32"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={`${user.user_id}~${index}`} className="even:bg-gray-100 text-center hover:bg-gray-200 transition">
                  <td className="px-4 py-2 text-black border border-gray-300 w-20">{user.user_id}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">{user.username}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.first_name}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.last_name}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-48 truncate">{user.email}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.phone_number}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">{user.gender}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-28">{formatDate(user.dob)}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">{user.age_group}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.country}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.state}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.city}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-24">{user.pincode}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-40">{user.occupation}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-40">{user.industry}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{user.income}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-60 truncate">{user.address}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{formatDate(user.created_date)}</td>
                  <td className="px-4 py-2 text-black border border-gray-300 w-32">{formatDate(user.updated_date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={19} className="text-center py-4 text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
