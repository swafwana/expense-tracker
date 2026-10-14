import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Budgets() {
  const { token } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [editingId, setEditingId] = useState(null);
  async function loadBudgets() {
    try {
      const response = await fetch("http://localhost:8000/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBudgets(data);
      } else {
        setMessage(JSON.stringify(data.detail));
      }
    } catch (error) {
      setMessage("Could not reach the server");
    }
  }
  async function loadCategories() {
    const response = await fetch("http://localhost:8000/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setCategories(data);
  }


  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, []);
  async function handleAdd(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          amount: Number(amount),
          month: month + "-01",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("");
        setAmount("");
        loadBudgets();
      } else {
        setMessage(JSON.stringify(data.detail));
      }
    } catch (error) {
      setMessage("Could not reach the server");
    }
  }
  function getCategoryName(id) {
    const found = categories.find((category) => category.id === id);
    return found ? found.name : "Unknown";
  }
  async function handleDelete(id) {
    if (!window.confirm("Delete this budget?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessage("");
        loadBudgets();
      } else {
        const data = await response.json();
        setMessage(JSON.stringify(data.detail));
      }
    } catch (error) {
      setMessage("Could not reach the server");
    }
  }
  function startEdit(budget) {
    setEditingId(budget.id);
    setCategoryId(budget.category_id);
    setAmount(Number(budget.amount));
    setMonth(budget.month.slice(0, 7));
  }

  function cancelEdit() {
    setEditingId(null);
    setCategoryId("");
    setAmount("");
    setMonth("");
  }
  async function handleSave(e) {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/budgets/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          month: month + "-01",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        cancelEdit();
        loadBudgets();
      } else {
        setMessage(JSON.stringify(data.detail));
      }
    } catch (error) {
      setMessage("Could not reach the server");
    }
  }

  return (
    <div>
      <h1>Budgets</h1>
      {message && <p>{message}</p>}
      <form onSubmit={editingId ? handleSave : handleAdd}>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={editingId !== null} required>
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <input type="number" placeholder="Amount" value={amount}
          onChange={(e) => setAmount(e.target.value)} required />
        <input type="month" value={month}
          onChange={(e) => setMonth(e.target.value)} required />
        <button type="submit">{editingId ? "Save" : "Add budget"}</button>
        {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
      </form>
      <ul>
        {budgets.map((budget) => (
          <li key={budget.id}>
            {getCategoryName(budget.category_id)}: {budget.amount} for {budget.month}
            <button onClick={() => handleDelete(budget.id)}>Delete</button>
            <button onClick={() => startEdit(budget)}>Edit</button>

          </li>
        ))}
      </ul>
    </div>
  );
}

export default Budgets;