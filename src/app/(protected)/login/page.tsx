'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import './login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (username === "finance_admin" && password === "admin@123") {
      localStorage.setItem("admin", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid credentials!");
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>LOGIN</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input type="submit" value="LOGIN" />
      </form>
    </div>
  );
};

export default Login;