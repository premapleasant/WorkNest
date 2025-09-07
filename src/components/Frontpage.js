import { useNavigate } from "react-router-dom";
import "./Frontpage.css";

function Frontpage() {
  const navigate = useNavigate();

  return (
    <div className="frontpage-container">
      <div className="overlay"></div>
      <div className="frontpage-box">
        <h1 className="frontpage-title">Welcome to WorkNest</h1>
        <p className="frontpage-subtitle">Manage your tasks effortlessly</p>
        <div className="button-group">
          <button
            className="btn btn-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="btn btn-register"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Frontpage;
