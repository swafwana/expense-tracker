import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

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
  async function handleDelete(id) {
  if (!window.confirm("Delete this category and its budgets and expenses?")) {
    return;
  }
  try {
    const response = await fetch(`http://localhost:8000/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
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
async function handleSave(id) {
  try {
    const response = await fetch(`http://localhost:8000/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editName }),
    });
    if (response.ok) {
      setEditingId(null);
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
          <li key={category.id}>
  {editingId === category.id ? (
    <>
      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
      />
      <button onClick={() => handleSave(category.id)}>Save</button>
      <button onClick={() => setEditingId(null)}>Cancel</button>
    </>
  ) : (
    <>
      {category.name}
      <button
        onClick={() => {
          setEditingId(category.id);
          setEditName(category.name);
        }}
      >
        Edit
      </button>
      <button onClick={() => handleDelete(category.id)}>Delete</button>
    </>
  )}
  </li>
       ))}
    </ul>
    </div>
  );
}

export default Categories;