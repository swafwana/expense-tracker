import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/login");
      } else {
        setMessage(JSON.stringify(data));
      }    } catch (error) {
      setMessage("Request failed: " + error.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-16 p-6 border border-gray-200 rounded-lg shadow-sm"
    >
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      <input
        className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="w-full bg-green-600 text-white rounded py-2">
        Register
      </button>

      <p className="mt-4 text-sm text-gray-600 break-all">{message}</p>
    </form>
  );
}

export default Register;