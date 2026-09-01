import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Main branch modules
import Browse from "./pages/Browse";
import ArticleDetail from "./pages/ArticleDetail";
import WriteArticle from "./pages/WriteArticle";

import { api } from "./services/api";
import { Eye, Heart } from "lucide-react";

// Fallback Browse page in case the API-based browse page needs a simple view
const BrowseFallback = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.getArticles().then(setArticles).catch(console.error);
  }, []);

  return (
    <div>
      <h2
        className="serif-title"
        style={{ fontSize: "2rem", marginBottom: "8px" }}
      >
        Browse Articles
      </h2>

      <p className="body-para" style={{ marginBottom: "24px" }}>
        Explore science, technology, environment and more written by our
        authors.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {articles.map((art) => (
          <div
            key={art.id}
            className="lumen-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "20px",
            }}
          >
            {art.image_url && (
              <img
                src={art.image_url}
                alt={art.title}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}

            <span
              className="meta-text"
              style={{
                textTransform: "uppercase",
                fontSize: "0.75rem",
                color: "var(--color-forest)",
                fontWeight: "bold",
              }}
            >
              {art.category}
            </span>

            <h3
              className="serif-title"
              style={{ fontSize: "1.25rem", minHeight: "60px" }}
            >
              {art.title}
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                color: "#6b7280",
                marginTop: "auto",
              }}
            >
              <span>{art.read_time} read</span>

              <div style={{ display: "flex", gap: "10px" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <Eye size={12} /> {art.views}
                </span>

                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <Heart size={12} /> {art.likes}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("Priya Mehta (author)");
  const [loading, setLoading] = useState(true);

  // Restore authentication when the application starts
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("lumen_token");

      if (token) {
        try {
          const data = await api.getMe();
          setCurrentUser(data.user);
        } catch (err) {
          console.error("Token authentication failed:", err);
          api.logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Role/profile switching used by the existing team UI
  const handleUserSwitch = async (email) => {
    setLoading(true);

    try {
      const data = await api.login(email, "password123");
      setCurrentUser(data.user);
      setRole(`${data.user.name} (${data.user.role})`);
    } catch (err) {
      console.error("Error switching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.1rem",
          }}
        >
          LUMEN: Loading user profile...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-frame">
        <Navbar
          currentUser={currentUser}
          onUserSwitch={handleUserSwitch}
          onLogout={handleLogout}
          currentRole={role}
          setRole={setRole}
        />

        <main className="lumen-content">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Authentication */}
            <Route
              path="/login"
              element={
                currentUser ? (
                  <Navigate to="/profile" />
                ) : (
                  <Login onLoginSuccess={setCurrentUser} />
                )
              }
            />

            <Route
              path="/register"
              element={
                currentUser ? (
                  <Navigate to="/profile" />
                ) : (
                  <Register onRegisterSuccess={setCurrentUser} />
                )
              }
            />

            {/* User Management */}
            <Route
              path="/profile"
              element={
                currentUser ? (
                  <Profile
                    currentUser={currentUser}
                    onProfileUpdate={setCurrentUser}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Search & Browse */}
            <Route path="/browse" element={<Browse />} />

            {/* Article / Blog */}
            <Route path="/article/:id" element={<ArticleDetail />} />

            {/* Author article creation */}
            <Route
              path="/write"
              element={
                currentUser ? (
                  <WriteArticle />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Optional fallback */}
            <Route path="/browse-fallback" element={<BrowseFallback />} />

            {/* Unknown route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;