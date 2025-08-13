import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function Tracker({ onLogout }) {
  const [entries, setEntries] = useState([]);
  const [activity, setActivity] = useState("");
  const [emission, setEmission] = useState("");
  const [riskInfo, setRiskInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data));
  }, []);

  const getRiskCategory = (emission) => {
    if (emission < 5) {
      return {
        category: "✅ Safe Usage",
        color: "green",
        advice: "You're doing great! Keep it up.",
        twColor: "green-500"
      };
    } else if (emission < 10) {
      return {
        category: "⚠️ Medium Risk Usage",
        color: "amber",
        advice: "Try reducing travel or power consumption.",
        twColor: "amber-500"
      };
    } else {
      return {
        category: "🚨 Dangerous Usage",
        color: "rose",
        advice: "Consider using public transport or reducing appliance usage.",
        twColor: "rose-500"
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activity || !emission) return;
    const emissionVal = parseFloat(emission);

    const res = await fetch("http://localhost:5000/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity, emission: emissionVal }),
    });
    const newEntry = await res.json();
    setEntries([newEntry, ...entries]);
    setActivity("");
    setEmission("");

    const risk = getRiskCategory(emissionVal);
    setRiskInfo(risk);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (onLogout) onLogout();
    navigate("/login");
  };

  const chartData = entries
    .slice()
    .reverse()
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString(),
      emission: Number(e.emission),
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">Carbon Footprint Tracker</h1>
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-6">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Activity"
          />
          <input
            className="w-40 border border-gray-300 rounded-lg px-4 py-2"
            value={emission}
            onChange={(e) => setEmission(e.target.value)}
            type="number"
            placeholder="Emission (kg CO2e)"
            min="0"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg"
          >
            Add Entry
          </button>
        </form>

        {/* Risk Popup */}
        {riskInfo && (
          <div className={`bg-${riskInfo.twColor} text-white p-4 rounded-lg mb-6`}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{riskInfo.category}</h2>
              <button onClick={() => setRiskInfo(null)} className="text-white text-xl">&times;</button>
            </div>
            <p className="text-sm mt-1">{riskInfo.advice}</p>
          </div>
        )}

        {/* Entries */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Activity Entries</h2>
        <ul className="space-y-2 mb-8">
          {entries.map((entry) => (
            <li
              key={entry._id}
              className="bg-gray-100 px-4 py-2 rounded-lg text-sm"
            >
              <strong>{new Date(entry.date).toLocaleDateString()}</strong>: {entry.activity} — {entry.emission} kg CO<sub>2</sub>e
            </li>
          ))}
          {entries.length === 0 && (
            <li className="text-gray-500 text-sm">No entries yet.</li>
          )}
        </ul>

        {/* Chart */}
        <h3 className="text-xl text-gray-800 font-semibold mb-2">Emissions Over Time</h3>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "kg CO2e", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Line type="monotone" dataKey="emission" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
