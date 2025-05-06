"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast, Toaster } from "sonner";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    console.log(result)
    setLoading(false);

    if (result?.error || result?.url?.includes("/api/auth/signin")) {
      console.log("Login failed:", result.error);
      setError("Invalid username or password");
    } else if (result?.ok && result?.url) {
      toast.success("Welcome Back Admin!");
      router.push("/super-admin/dashboard");
    } else {
      console.error("Unexpected login result:", result);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <div className="w-full max-w-sm">
        {/* Left sidebar styling similar to the app */}
        <div className="bg-green-800 p-4 rounded-t-lg flex items-center">
          <div className="bg-white rounded-full p-2 mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Database Access</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-b-lg shadow-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login
          </h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            required
          />

          {error && (
            <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-green-800 hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
