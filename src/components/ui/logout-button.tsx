"use client";

import { signOut } from "next-auth/react";

const LogoutButton = () => {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/super-admin/login" })}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition "
    >
      Logout
    </button>
  );
};

export default LogoutButton;
