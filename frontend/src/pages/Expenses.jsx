import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Expenses() {
 
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadExpenses() {
    try {
      const response = await fetch("http://localhost:8000/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        setMessage("Could not load expenses");
      }
    } catch (err) {
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
    loadExpenses();
    loadCategories();
  }, [token]);
  async function handleAdd(e) {
  e.preventDefault();
  setMessage("");
  try {
    const response = await fetch("http://localhost:8000/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        category_id: Number(categoryId),
        amount: Number(amount),
        description: description,
        date: date,
      }),
    });
    if (response.ok) {
      setAmount("");
      setDescription("");
      setDate("");
      loadExpenses();
    } else {
      const error = await response.json();
      setMessage(JSON.stringify(error.detail));
    }
  } catch (err) {
    setMessage("Could not reach the server");
  }
}
async function handleDelete(id) {
  const sure = window.confirm(" Delete this expense? ");
  if (!sure) return;
  setMessage("");
  try {
    const response = await fetch(`http://localhost:8000/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      setMessage("");
      loadExpenses();
    } else {
      const error = await response.json();
      setMessage(JSON.stringify(error.detail));
    }
  } catch (err) {
    setMessage("Could not reach the server");
  }
}
function startEdit(expense) {
  setEditingId(expense.id);
  setCategoryId(String(expense.category_id));
  setAmount(expense.amount);
  setDescription(expense.description || "");
  setDate(expense.date);
}

function cancelEdit() {
  setEditingId(null);
  setCategoryId("");
  setAmount("");
  setDescription("");
  setDate("");
}

async function handleSave(e) {
  e.preventDefault();
  setMessage("");
  try {
    const response = await fetch(`http://localhost:8000/expenses/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        category_id: Number(categoryId),
        amount: Number(amount),
        description: description,
        date: date,
      }),
    });
    if (response.ok) {
      cancelEdit();
      loadExpenses();
    } else {
      const error = await response.json();
      setMessage(JSON.stringify(error.detail));
    }
  } catch (err) {
    setMessage("Could not reach the server");
  }
}
    return (
    <div>
      <h1>Expenses</h1>
      {message && <p>{message}</p>}

        <form onSubmit={editingId ? handleSave : handleAdd}> 
          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        <input
          required
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
          <button type="submit">{editingId ? "Save" : "Add"}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>Cancel</button>
          )}
        </form>
      
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.amount} - {expense.description} - {expense.date}
            <button onClick={() => handleDelete(expense.id)}>Delete</button>
            <button onClick={() => startEdit(expense)}>Edit</button>
          </li>
        ))}
        
      </ul>
      
    </div>
  );
}

export default Expenses;