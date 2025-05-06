"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function EditStockRecord() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    status: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin-management/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result = await res.json();
        const user = result.data;

        setFormData({
          username: user.username || "",
          email: user.email || "",
          password: "", 
          role: user.role || "",
          status: user.isActive ? "active" : "inactive",
        });

        setLoading(false);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load user.");
        setLoading(false);
      }
    }

    if (id) {
      fetchUser();
    }
  }, [id]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const transformedData = {
        ...formData,
        isActive: formData.status === "active",
      };

      const res = await fetch(`/api/admin-management/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!res.ok) {
        throw new Error("Failed to update the record.");
      }

      toast.success("User updated successfully!");
      setTimeout(() => {
        router.push("/super-admin/database/admin-management");
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  }

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Toaster />
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Edit Stock Record
      </h1>

      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold">Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300 w-full"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300 w-full"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label className="text-gray-700 font-semibold">Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300 w-full pr-10"
            />
            <div
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold">Role:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300 w-full"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super_Admin</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold">Status:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-indigo-300 w-full"
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Update Record
          </button>
        </div>
      </form>
    </div>
  );
}
