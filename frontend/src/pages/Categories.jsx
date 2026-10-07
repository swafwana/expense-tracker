import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function loadCategories() {
  const response = await fetch("http://localhost:8000/categories", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  setCategories(data);
  }

  useEffect(() => {
    loadCategories();
  }, [token]);
  async function handleAdd(e) {
  e.preventDefault();
  try {
    const response = await fetch("http://localhost:8000/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: name }),
    });
    if (response.ok) {
      setName("");
      setMessage("");
      loadCategories();
    } else {
      const error = await response.json();
      setMessage(error.detail);
    }
  } catch {
    setMessage("Could not reach the server");
  }
  }

  return (
    <div>
      <h1>Categories</h1>
      <form onSubmit={handleAdd}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
        />
        <button type="submit">Add</button>
      </form>
      <p>{message}</p>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Categories;