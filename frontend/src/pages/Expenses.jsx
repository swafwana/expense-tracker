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
    return (
    <div>
      <h1>Expenses</h1>
      {message && <p>{message}</p>}

      <form onSubmit={handleAdd}>
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
        <button type="submit">Add</button>
      </form>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.amount} - {expense.description} - {expense.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;