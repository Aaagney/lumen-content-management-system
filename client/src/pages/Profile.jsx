import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Edit2, Save, Eye, ThumbsUp, FileText } from "lucide-react";

function Profile({ currentUser, onProfileUpdate }) {
  const [articles, setArticles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [fullname, setFullname] = useState(
    currentUser ? currentUser.fullname : ""
  );
  const [bio, setBio] = useState(currentUser ? currentUser.bio : "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (currentUser) {
      setFullname(currentUser.fullname);
      setBio(currentUser.bio || "");
      fetchUserArticles();
    }
  }, [currentUser]);

  const fetchUserArticles = async () => {
    if (!currentUser) return;

    try {
      const fetched = await api.getArticles(currentUser.id);
      setArticles(fetched);
    } catch (err) {
      console.error("Failed to load user articles:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.updateProfile(fullname, bio);

      onProfileUpdate({
        ...currentUser,
        fullname,
        bio,
      });

      setIsEditing(false);
      setMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <h2 className="serif-title">Access Denied</h2>
        <p className="body-para">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  const totalArticles = articles.length;

  const publishedArticles = articles.filter(
    (a) => a.status === "Published"
  ).length;

  const totalViews = articles.reduce(
    (sum, a) => sum + (a.views || 0),
    0
  );

  const totalLikes = articles.reduce(
    (sum, a) => sum + (a.likes || 0),
    0
  );

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div>
      {message.text && (
        <div className={`alert-banner ${message.type}`}>
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="lumen-card profile-card">
        <div className="profile-avatar-large">
          {getInitials(currentUser.fullname)}
        </div>

        <div className="profile-info">
          {isEditing ? (
            <form
              onSubmit={handleUpdate}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <input
                type="text"
                className="form-input"
                style={{
                  paddingLeft: "14px",
                  fontSize: "1.5rem",
                  fontFamily: "var(--font-serif)",
                  fontWeight: "bold",
                }}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />

              <textarea
                className="form-input"
                style={{
                  paddingLeft: "14px",
                  height: "80px",
                  resize: "none",
                }}
                placeholder="Write a short bio..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "4px",
                }}
              >
                <button
                  type="submit"
                  className="btn-forest"
                  style={{
                    width: "auto",
                    padding: "8px 16px",
                  }}
                  disabled={loading}
                >
                  <Save size={14} />
                  <span>
                    {loading ? "Saving..." : "Save Changes"}
                  </span>
                </button>

                <button
                  type="button"
                  className="role-select-trigger"
                  onClick={() => {
                    setIsEditing(false);
                    setFullname(currentUser.fullname);
                    setBio(currentUser.bio || "");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <h1 className="serif-title profile-name">
                  {currentUser.fullname}
                </h1>

                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  <Edit2 size={16} />
                </button>
              </div>

              <p className="profile-bio">
                {currentUser.bio || "No bio added yet."}
              </p>
            </>
          )}

          {/* Statistics */}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-val">{totalArticles}</span>
              <span className="stat-lbl">Articles</span>
            </div>

            <div className="stat-item">
              <span className="stat-val">{publishedArticles}</span>
              <span className="stat-lbl">Published</span>
            </div>

            <div className="stat-item">
              <span className="stat-val">
                {totalViews.toLocaleString()}
              </span>
              <span className="stat-lbl">Total Views</span>
            </div>

            <div className="stat-item">
              <span className="stat-val">
                {totalLikes.toLocaleString()}
              </span>
              <span className="stat-lbl">Total Likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Articles */}
      <h2 className="articles-heading">My Articles</h2>

      {articles.length > 0 ? (
        <div className="articles-list">
          {articles.map((art) => (
            <div
              key={art.id}
              className="article-row-card"
            >
              <div className="article-row-left">
                {art.image_url ? (
                  <img
                    src={art.image_url}
                    alt={art.title}
                    className="article-row-img"
                  />
                ) : (
                  <div
                    className="article-row-img"
                    style={{
                      backgroundColor: "#eae7de",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                    }}
                  >
                    <FileText size={18} />
                  </div>
                )}

                <div className="article-row-details">
                  <h3 className="article-row-title">
                    {art.title}
                  </h3>

                  <div className="article-row-meta">
                    <span>{art.category}</span>
                    <span>•</span>
                    <span>{art.read_time} read</span>
                    <span>•</span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <Eye size={12} />
                      {art.views || 0}
                    </span>

                    <span>•</span>

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <ThumbsUp size={12} />
                      {art.likes || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="article-row-right">
                <span
                  className={`status-badge ${
                    art.status === "Published"
                      ? "published"
                      : "pending"
                  }`}
                >
                  {art.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
          }}
        >
          <p className="body-para">
            You haven't written any articles yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default Profile;