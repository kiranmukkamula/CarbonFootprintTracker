import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();

        // ✅ Fix: Use `data` instead of `user` which was undefined
        localStorage.setItem("user", JSON.stringify(data));

        // ✅ Notify App.js
        if (onLogin) onLogin();

        // ✅ Redirect to tracker
        navigate("/");
      } else {
        let msg = "Invalid credentials";
        try {
          const err = await res.json();
          if (err && err.error) msg = err.error;
        } catch {}
        setError(msg);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
   <div className="max-w-md mx-auto mt-40 p-6 bg-white shadow-md rounded">
  <h2 className="text-2xl font-semibold mb-4">Login</h2>
  <form onSubmit={handleLogin}>
    <input
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      type="email"
      required
      className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      type="password"
      required
      className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
    >
      Login
    </button>
  </form>

  {error && (
    <div className="text-red-600 mt-3">{error}</div>
  )}

  <div className="mt-4 text-sm">
    Don&apos;t have an account?{" "}
    <Link to="/register" className="text-blue-600 hover:underline">
      Register
    </Link>
  </div>
</div>

  );
}
