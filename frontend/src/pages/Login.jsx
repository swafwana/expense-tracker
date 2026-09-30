import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(JSON.stringify(data));
        return;
      }

      login(data.access_token);
      navigate("/dashboard");    } catch (err) {
      setError("Could not reach the server");
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm p-4">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border p-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border p-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
        >
          Log in
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {result && (
        <pre className="mt-4 break-all whitespace-pre-wrap rounded bg-gray-100 p-2 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default Login;