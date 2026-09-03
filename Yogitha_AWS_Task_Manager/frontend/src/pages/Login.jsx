import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    localStorage.setItem("taskManagerLoggedIn", "true");
    localStorage.setItem("taskManagerUser", username);

    navigate("/tasks");
  };

  return (
    <div className="login-page">

      <div className="login-decoration decoration-one"></div>
      <div className="login-decoration decoration-two"></div>

      <div className="login-card">

        <div className="login-logo">✓</div>

        <p className="login-label">WELCOME BACK</p>

        <h1>Sign In</h1>

        <p className="login-subtitle">
          Access your personal task dashboard
        </p>

        <form onSubmit={handleLogin}>

          <label>Username</label>

          <div className="input-wrapper">
            <span>👤</span>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
            />
          </div>

          <label>Password</label>

          <div className="input-wrapper">
            <span>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            Sign In →
          </button>

        </form>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

        <p className="login-tech">
          Secured & hosted with AWS
        </p>

      </div>
    </div>
  );
}

export default Login;