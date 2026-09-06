import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Heart, Eye, MessageCircle } from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Temporary current user
  // We will connect this to the real logged-in user later.
  const currentUser = {
    id: 1,
    name: 'Lena Kaufmann'
  };

  // Load article
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/articles/${id}`)
      .then((res) => setArticle(res.data))
      .catch((err) => console.error('Failed to load article:', err));
  }, [id]);

  // Load comments
  useEffect(() => {
    setLoadingComments(true);

    axios
      .get(`http://localhost:5000/api/comments/article/${id}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error('Failed to load comments:', err))
      .finally(() => setLoadingComments(false));
  }, [id]);

  // Submit comment or reply
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    setSubmitting(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/comments',
        {
          article_id: Number(id),
          user_id: currentUser.id,
          content: commentText.trim(),
          parent_id: replyTo
        }
      );

      setComments((prev) => [...prev, response.data]);
      setCommentText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Unable to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const topLevelComments = comments.filter(
    (comment) => !comment.parent_id
  );

  const getReplies = (commentId) => {
    return comments.filter(
      (comment) => Number(comment.parent_id) === Number(commentId)
    );
  };

  if (!article) {
    return (
      <div className="container">
        <p>Loading article...</p>
      </div>
    );
  }

  const authorInitial = article.author_name
    ? article.author_name.charAt(0).toUpperCase()
    : 'A';

  return (
    <div
      className="container"
      style={{
        maxWidth: '760px',
        marginTop: '32px',
        paddingBottom: '60px'
      }}
    >
      {/* Category */}
      <span
        className="badge badge-published"
        style={{ marginBottom: '12px' }}
      >
        {article.category || 'General'}
      </span>

      {/* Title */}
      <h1
        style={{
          fontSize: '38px',
          lineHeight: 1.2,
          margin: '12px 0'
        }}
      >
        {article.title}
      </h1>

      {/* Author + Article Metadata */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '24px 0',
          paddingBottom: '20px',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        {/* Avatar fallback */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#DDE9E3',
            color: '#1E3A2B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '18px'
          }}
        >
          {authorInitial}
        </div>

        <div>
          <strong style={{ display: 'block' }}>
            {article.author_name || 'Unknown Author'}
          </strong>

          <span
            style={{
              fontSize: '13px',
              color: '#777'
            }}
          >
            Published • {article.read_time || '5 min'}
          </span>
        </div>
      </div>

      {/* Article Image */}
      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.title}
          style={{
            width: '100%',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'block'
          }}
        />
      )}

      {/* Article Statistics */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          padding: '14px 0',
          borderBottom: '1px solid #E2E8F0',
          color: '#777',
          fontSize: '14px'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Eye size={17} />
          {article.views || 0} views
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Heart size={17} />
          {article.likes || 0} likes
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <MessageCircle size={17} />
          {comments.length} comments
        </span>
      </div>

      {/* Content unavailable in current database */}
      <div
        style={{
          marginTop: '28px',
          padding: '20px',
          background: '#F5F3EE',
          borderRadius: '8px',
          color: '#666',
          lineHeight: 1.6
        }}
      >
        <strong>Article content</strong>
        <p style={{ marginBottom: 0 }}>
          The article text is not currently stored in the database.
          The current database contains the article title, category,
          metadata, image, and author information.
        </p>
      </div>

      {/* Comments & Discussion */}
      <section
        style={{
          marginTop: '56px',
          paddingTop: '32px',
          borderTop: '1px solid #E2E8F0'
        }}
      >
        <h2
          style={{
            fontSize: '28px',
            marginBottom: '8px'
          }}
        >
          Comments & Discussion
        </h2>

        <p
          style={{
            color: '#777',
            marginBottom: '24px'
          }}
        >
          Share your thoughts, questions, or perspective on this article.
        </p>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment}>
          {replyTo && (
            <div
              style={{
                marginBottom: '8px',
                fontSize: '14px',
                color: '#666'
              }}
            >
              Replying to a comment

              <button
                type="button"
                onClick={() => setReplyTo(null)}
                style={{
                  marginLeft: '8px',
                  border: 'none',
                  background: 'none',
                  color: '#2F5D50',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          )}

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows="4"
            style={{
              width: '100%',
              padding: '14px',
              border: '1px solid #CBD5E0',
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '15px',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            style={{
              marginTop: '10px',
              padding: '10px 18px',
              border: 'none',
              borderRadius: '6px',
              background: '#2F5D50',
              color: '#fff',
              cursor:
                submitting || !commentText.trim()
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                submitting || !commentText.trim() ? 0.6 : 1
            }}
          >
            {submitting
              ? 'Posting...'
              : replyTo
              ? 'Post Reply'
              : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        <div style={{ marginTop: '36px' }}>
          {loadingComments ? (
            <p style={{ color: '#777' }}>
              Loading comments...
            </p>
          ) : topLevelComments.length === 0 ? (
            <p style={{ color: '#777' }}>
              No comments yet. Be the first to start the discussion.
            </p>
          ) : (
            topLevelComments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  marginBottom: '28px'
                }}
              >
                {/* Main Comment */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#DDE9E3',
                      color: '#1E3A2B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0
                    }}
                  >
                    {comment.user_name
                      ? comment.user_name.charAt(0).toUpperCase()
                      : 'U'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <strong>
                      {comment.user_name}
                    </strong>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        marginTop: '2px'
                      }}
                    >
                      {new Date(
                        comment.created_at
                      ).toLocaleString()}
                    </div>

                    <p
                      style={{
                        margin: '8px 0',
                        lineHeight: 1.6,
                        color: '#2D3748'
                      }}
                    >
                      {comment.content}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setReplyTo(comment.id)
                      }
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: '#2F5D50',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {getReplies(comment.id).length > 0 && (
                  <div
                    style={{
                      marginLeft: '52px',
                      marginTop: '18px',
                      paddingLeft: '18px',
                      borderLeft: '2px solid #E2E8F0'
                    }}
                  >
                    {getReplies(comment.id).map((reply) => (
                      <div
                        key={reply.id}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          marginBottom: '18px'
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#DDE9E3',
                            color: '#1E3A2B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            flexShrink: 0
                          }}
                        >
                          {reply.user_name
                            ? reply.user_name
                                .charAt(0)
                                .toUpperCase()
                            : 'U'}
                        </div>

                        <div>
                          <strong>
                            {reply.user_name}
                          </strong>

                          <div
                            style={{
                              fontSize: '12px',
                              color: '#888',
                              marginTop: '2px'
                            }}
                          >
                            {new Date(
                              reply.created_at
                            ).toLocaleString()}
                          </div>

                          <p
                            style={{
                              margin: '6px 0 0',
                              lineHeight: 1.5,
                              color: '#2D3748'
                            }}
                          >
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}