import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <Link to="/categories">Categories</Link><br></br>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;