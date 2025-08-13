import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      navigate("/login");
    } else {
      // Try to get error message from backend
      let msg = "Registration failed";
      try {
        const err = await res.json();
        if (err && err.error) msg = err.error;
      } catch {}
      setError(msg);
    }
  };

 return (
  <div className="max-w-md mx-auto mt-40 p-6 bg-white shadow-md rounded">
    <h2 className="text-2xl font-semibold mb-4">Register</h2>
    <form onSubmit={handleRegister}>
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
        Register
      </button>
    </form>

    {error && <div className="text-red-600 mt-3">{error}</div>}

    <div className="mt-4 text-sm">
      Already have an account?{" "}
      <Link to="/login" className="text-blue-600 hover:underline">
        Login
      </Link>
    </div>
  </div>
);

}