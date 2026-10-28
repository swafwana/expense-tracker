import { useNavigate,  Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [comparisons, setComparisons] = useState([]);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(currentMonth);
  async function loadCategories() {
  try {
    const response = await fetch("http://localhost:8000/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      setCategories(data);
      loadAllComparisons(data, month);
      
    } else {
      setMessage(JSON.stringify(data.detail));
    }
  } catch (error) {
    setMessage("Could not reach the server");
  }
}
  async function loadComparison(categoryId, chosenMonth)  {
    try {
      const response = await fetch(
         `http://localhost:8000/summary/comparison?category_id=${categoryId}${chosenMonth ? `&month=${chosenMonth}-01` : ""}`, 
                 {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        setMessage(JSON.stringify(data.detail));
        return null;
        
      }
    } catch (error) {
      setMessage("Could not reach the server");
      return null;
      
    }
  }
  async function loadAllComparisons(list, chosenMonth) {
    const results = [];
    for (const category of list) {
    const data = await loadComparison(category.id, chosenMonth);
      if (data) {
        results.push(data);
      }
    }
    setComparisons(results);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }
  useEffect(() => {
  loadCategories();
  
}, []);
useEffect(() => {
  loadAllComparisons(categories, month);
}, [month]);
  function getCategoryName(id) {
    const found = categories.find((category) => category.id === id);
    return found ? found.name : "Unknown";
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <Link to="/categories">Categories</Link><br></br>
      <Link to="/expenses">Expenses</Link><br></br>
      <Link to="/budgets">Budgets</Link><br></br>
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      {message && <p>{message}</p>}
      
        {comparisons.map((item) => (
          <div key={item.category_id}>
            <p>
              {getCategoryName(item.category_id)}: spent {item.spent_amount}
              {item.budgeted_amount === null
                ? " (no budget set)"
                : ` of ${item.budgeted_amount}`}
              {item.remaining !== null &&
                (Number(item.remaining) < 0
                  ? ` - over budget by ${Math.abs(Number(item.remaining))}`
                  : ` - ${Number(item.remaining)} left`)}
            </p>
            {item.budgeted_amount !== null && (
              <progress value={Number(item.spent_amount)} max={Number(item.budgeted_amount)}></progress>
            )}
          </div>
        ))}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
