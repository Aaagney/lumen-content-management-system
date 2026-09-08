import React, { useEffect, useState } from 'react';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

function CommentItem({ comment, replies, onReply }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await onReply(replyText, comment.id);
    setReplyText('');
    setReplying(false);
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <img
          src={comment.user_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + comment.user_name}
          alt={comment.user_name}
          style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ background: '#F7F7F5', borderRadius: '8px', padding: '10px 12px' }}>
            <strong style={{ fontSize: '13px' }}>{comment.user_name}</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#333' }}>{comment.content}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#888' }}>
            <span>{new Date(comment.created_at).toLocaleString()}</span>
            {user && (
              <button
                onClick={() => setReplying(r => !r)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-green)', fontSize: '12px', padding: 0 }}
              >
                Reply
              </button>
            )}
          </div>

          {replying && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                className="input-field"
                style={{ margin: 0 }}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user_name}...`}
              />
              <button className="btn btn-primary" onClick={submitReply}>Post</button>
            </div>
          )}

          {replies.length > 0 && (
            <div style={{ marginLeft: '20px', borderLeft: '2px solid #EEE', paddingLeft: '12px' }}>
              {replies.map(r => (
                <CommentItem key={r.id} comment={r} replies={[]} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ articleId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = () => {
    setLoading(true);
    setError('');
    http.get(`/api/comments/article/${articleId}`)
      .then(res => setComments(res.data))
      .catch(() => setError('Could not load comments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const postComment = async (content, parentId = null) => {
    try {
      await http.post('/api/comments', { article_id: Number(articleId), content, parent_id: parentId });
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    await postComment(newComment);
    setNewComment('');
    setPosting(false);
  };

  const topLevel = comments.filter(c => !c.parent_id);
  const repliesFor = (id) => comments.filter(c => c.parent_id === id);

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
      <h3>Comments {comments.length > 0 && `(${comments.length})`}</h3>

      {user ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            className="input-field"
            style={{ margin: 0 }}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={posting}>
            {posting ? 'Posting...' : 'Post'}
          </button>
        </form>
      ) : (
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
          Log in to join the discussion.
        </p>
      )}

      {loading && <p style={{ color: '#888', fontSize: '14px' }}>Loading comments...</p>}
      {!loading && error && <p style={{ color: 'crimson', fontSize: '14px' }}>{error}</p>}
      {!loading && !error && topLevel.length === 0 && (
        <p style={{ color: '#888', fontSize: '14px' }}>No comments yet — be the first to say something.</p>
      )}

      {!loading && topLevel.map(c => (
        <CommentItem key={c.id} comment={c} replies={repliesFor(c.id)} onReply={postComment} />
      ))}
    </div>
  );
}
