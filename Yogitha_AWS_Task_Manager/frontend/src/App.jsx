import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import "./App.css";

function Home() {
  return (
    <div className="home-page">
      <div className="home-orb orb-one"></div>
      <div className="home-orb orb-two"></div>

      <div className="home-content">
        <div className="app-icon">✓</div>

        <p className="welcome-text">WELCOME TO</p>

        <h1>Task Manager</h1>

        <p className="home-description">
          Plan smarter. Stay organized.
          <br />
          Get more things done.
        </p>

        <div className="home-buttons">
          <Link to="/login">
            <button className="home-btn primary-btn">
              Get Started →
            </button>
          </Link>

        </div>

        <div className="features">
          <div className="feature-card">
            <span>✓</span>
            <strong>Simple</strong>
            <small>Easy task management</small>
          </div>

          <div className="feature-card">
            <span>⚡</span>
            <strong>Fast</strong>
            <small>Quick and responsive</small>
          </div>

          <div className="feature-card">
            <span>☁</span>
            <strong>AWS</strong>
            <small>Cloud hosted</small>
          </div>
        </div>

        <p className="home-footer">
          React • Node.js • PostgreSQL • AWS
        </p>
      </div>
    </div>
  );
}

function ProtectedTasks() {
  const loggedIn = localStorage.getItem("taskManagerLoggedIn");

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Tasks />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tasks" element={<ProtectedTasks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;