import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { api } from "./services/api";
import { Compass, Edit, Heart, Eye } from "lucide-react";

// Mock Fallback Browse page matching style
const BrowsePage = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.getArticles().then(setArticles).catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="serif-title" style={{ fontSize: "2rem", marginBottom: "8px" }}>Browse Articles</h2>
      <p className="body-para" style={{ marginBottom: "24px" }}>Explore science, technology, environment and more written by our authors.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {articles.map(art => (
          <div key={art.id} className="lumen-card" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px" }}>
            {art.image_url && (
              <img src={art.image_url} alt={art.title} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }} />
            )}
            <span className="meta-text" style={{ textTransform: "uppercase", fontSize: "0.75rem", color: "var(--color-forest)", fontWeight: "bold" }}>
              {art.category}
            </span>
            <h3 className="serif-title" style={{ fontSize: "1.25rem", minHeight: "60px" }}>{art.title}</h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280", marginTop: "auto" }}>
              <span>{art.read_time} read</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Eye size={12} /> {art.views}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "2px" }}><Heart size={12} /> {art.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock Fallback Write page matching style
const WritePage = () => (
  <div className="lumen-card" style={{ maxWidth: "700px", margin: "20px auto" }}>
    <h2 className="serif-title" style={{ fontSize: "2rem", marginBottom: "16px" }}>Write an Article</h2>
    <div className="form-group">
      <label className="form-label">Article Title</label>
      <input type="text" className="form-input" style={{ paddingLeft: "14px" }} placeholder="Enter a catchy title..." />
    </div>
    <div className="form-group">
      <label className="form-label">Category</label>
      <select className="form-input" style={{ paddingLeft: "14px", height: "46px" }}>
        <option>Science</option>
        <option>Technology</option>
        <option>Environment</option>
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">Content</label>
      <textarea className="form-input" style={{ paddingLeft: "14px", height: "180px", resize: "none" }} placeholder="Start writing..." />
    </div>
    <button className="btn-forest" onClick={() => alert("Article submitted for admin review!")}>
      <span>Submit for Review</span>
    </button>
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user on startup if token exists
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

  // Handler to switch simulated users from the dropdown
  const handleUserSwitch = async (email) => {
    setLoading(true);
    try {
      const data = await api.login(email, "password123");
      setCurrentUser(data.user);
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem" }}>LUMEN: Loading user profile...</div>
      </div>
    );
  }

  return (
    <Router>
      {/* Thick outer app frame with 2px border and rounded-3xl corners */}
      <div className="app-frame">
        {/* Nav header */}
        <Navbar 
          currentUser={currentUser} 
          onUserSwitch={handleUserSwitch} 
          onLogout={handleLogout} 
        />

        {/* Main application router container */}
        <main className="lumen-content">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route 
              path="/login" 
              element={
                currentUser ? <Navigate to="/profile" /> : <Login onLoginSuccess={setCurrentUser} />
              } 
            />
            
            <Route 
              path="/register" 
              element={
                currentUser ? <Navigate to="/profile" /> : <Register onRegisterSuccess={setCurrentUser} />
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                currentUser ? (
                  <Profile currentUser={currentUser} onProfileUpdate={setCurrentUser} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />

            <Route path="/browse" element={<BrowsePage />} />
            
            <Route 
              path="/write" 
              element={
                currentUser && currentUser.role === "author" ? (
                  <WritePage />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
