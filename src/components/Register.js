import { useState } from "react";
import axios from "axios";
import './Register.css';
import { useNavigate } from "react-router-dom";

function Register() {
  const [inputs, setInputs] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/register", inputs);
      alert("Registered Successfully");
      navigate('/login');
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <section className="register" aria-label="Register">
      <div className="register-card">
        {/* Left segment: Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          <h1 className="register-title">Create Account</h1>

          <div className="form-group">
            <label htmlFor="name">Username</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter Your Name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Your Email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter Your Password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-actions">
            <button type="submit" className="register-btn">Register</button>
          </div>

          <p className="login-redirect">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </form>

        {/* Right segment: Dummy Illustration */}
        <div className="register-image">
          <img 
            src="Images/Data_security.jpg" 
            alt="Register Illustration" 
          />
        </div>
      </div>
    </section>
  );
}

export default Register;
