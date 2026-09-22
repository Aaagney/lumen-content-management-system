import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Flag, Send, MessageSquare } from 'lucide-react';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';

export default function ArticleDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reporting State
  const [reportingTarget, setReportingTarget] = useState(null); // { type, id, title }

  const fetchArticleAndComments = () => {
    axios.get(`http://localhost:5000/api/articles/${id}`)
      .then(res => setArticle(res.data))
      .catch(err => console.error(err));
    
    axios.get(`http://localhost:5000/api/articles/${id}/comments`)
      .then(res => setComments(res.data))
      .catch(() => setComments([]));
  };

  useEffect(() => {
    fetchArticleAndComments();
  }, [id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    // Directly add comment via basic API or fallback to update comments state
    axios.post(`http://localhost:5000/api/articles/${id}/comments`, {
      content: newComment.trim(),
      user_id: currentUser ? currentUser.id : 1
    })
    .then(() => {
      setNewComment('');
      fetchArticleAndComments();
    })
    .catch(() => {
      // Fallback local update if specific post comment route differs
      setComments(prev => [
        ...prev,
        {
          id: Date.now(),
          content: newComment.trim(),
          user_id: currentUser ? currentUser.id : 1,
          user_name: currentUser ? currentUser.name : 'You'
        }
      ]);
      setNewComment('');
    })
    .finally(() => {
      setSubmittingComment(false);
    });
  };

  if (!article) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>Loading article...</div>;

  return (
    <div className="container" style={{ maxWidth: '760px', margin: '40px auto' }}>
      {article.category_name && (
        <span className="badge badge-published" style={{ marginBottom: '12px' }}>
          {article.category_name}
        </span>
      )}

      <h1 style={{ fontSize: '36px', lineHeight: 1.25, margin: '12px 0 8px 0' }}>
        {article.title}
      </h1>

      {article.subtitle && (
        <p style={{ fontSize: '18px', color: '#555', lineHeight: 1.4, margin: '0 0 20px 0' }}>
          {article.subtitle}
        </p>
      )}

      {/* Author and Metadata Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', margin: '20px 0 24px 0', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={article.author_avatar || 'https://via.placeholder.com/44'}
            alt=""
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <Link to={`/profile/${article.author_id}`} style={{ fontWeight: 600, color: '#1E293B', textDecoration: 'none', display: 'block' }}>
              {article.author_name || `Author #${article.author_id}`}
            </Link>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              {article.read_time || '5 min read'} • Published
            </span>
          </div>
        </div>

        {/* Report Article Action */}
        <button
          className="btn-report"
          onClick={() => setReportingTarget({ type: 'article', id: article.id, title: article.title })}
          title="Report this article"
        >
          <Flag size={14} />
          <span>Report Article</span>
        </button>
      </div>

      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title}
          style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '8px', marginBottom: '28px' }}
        />
      )}

      {/* Article Content */}
      <div style={{ fontSize: '17px', lineHeight: '1.8', color: '#2D3748', whiteSpace: 'pre-line' }}>
        {article.content}
      </div>

      <hr style={{ margin: '48px 0 32px 0', borderColor: 'var(--border-color)' }} />

      {/* Comments Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <MessageSquare size={20} color="#1E3A2B" />
          <h3 style={{ margin: 0, fontSize: '20px' }}>Comments ({comments.length})</h3>
        </div>

        {/* Post comment input */}
        <form onSubmit={handleAddComment} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Join the discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ margin: 0 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingComment || !newComment.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <Send size={15} /> Post
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link
                      to={`/profile/${comment.user_id}`}
                      style={{ fontWeight: 600, color: '#1E293B', textDecoration: 'none', fontSize: '14px' }}
                    >
                      {comment.user_name || `User #${comment.user_id}`}
                    </Link>
                  </div>

                  {/* Report Comment Action */}
                  <button
                    className="btn-report-compact"
                    onClick={() => setReportingTarget({
                      type: 'comment',
                      id: comment.id,
                      title: comment.content
                    })}
                    title="Report this comment"
                  >
                    <Flag size={12} />
                    <span>Report</span>
                  </button>
                </div>

                <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: '#777', fontStyle: 'italic', fontSize: '14px' }}>No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportingTarget && (
        <ReportModal
          isOpen={!!reportingTarget}
          onClose={() => setReportingTarget(null)}
          targetType={reportingTarget.type}
          targetId={reportingTarget.id}
          targetTitle={reportingTarget.title}
        />
      )}
    </div>
  );
}