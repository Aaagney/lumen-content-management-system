import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/articles/${id}`)
      .then(res => setArticle(res.data));
    
    axios.get(`http://localhost:5000/api/articles/${id}/comments`)
      .then(res => setComments(res.data))
      .catch(() => setComments([]));
  }, [id]);

  if (!article) return <div>Loading article...</div>;

  return (
    <div className="container" style={{ maxWidth: '720px', margin: '40px auto' }}>
      <h1>{article.title}</h1>
      <p style={{ color: '#666' }}>
        By <Link to={`/profile/${article.author_id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
          {article.author_name || `Author #${article.author_id}`}
        </Link>
      </p>
      
      <div style={{ marginTop: '20px', lineHeight: '1.7' }}>
        {article.content}
      </div>

      <hr style={{ margin: '40px 0' }} />

      <h3>Comments</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
              {/* Clickable commenter profile link */}
              <Link 
                to={`/profile/${comment.user_id}`} 
                style={{ fontWeight: 'bold', color: '#0066cc', textDecoration: 'none' }}
              >
                {comment.user_name}
              </Link>
              <p style={{ margin: '6px 0 0 0', color: '#555' }}>{comment.content}</p>
            </div>
          ))
        ) : (
          <p style={{ color: '#777' }}>No comments yet.</p>
        )}
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// export default function ArticleDetail() {
//   const { id } = useParams();
//   const [article, setArticle] = useState(null);

//   useEffect(() => {
//     axios.get(`http://localhost:5000/api/articles/${id}`)
//       .then(res => setArticle(res.data))
//       .catch(err => console.error(err));
//   }, [id]);

//   if (!article) return <div className="container"><p>Loading article...</p></div>;

//   return (
//     <div className="container" style={{ maxWidth: '760px', marginTop: '32px' }}>
//       <span className="badge badge-published" style={{ marginBottom: '12px' }}>{article.category_name}</span>
//       <h1 style={{ fontSize: '38px', lineHeight: 1.2, margin: '12px 0' }}>{article.title}</h1>
//       <p style={{ fontSize: '20px', color: '#555', lineHeight: 1.4 }}>{article.subtitle}</p>

//       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0', paddingBottom: '20px', borderBottom: '1px solid #E2E8F0' }}>
//         <img src={article.author_avatar} alt={article.author_name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
//         <div>
//           <strong style={{ display: 'block' }}>{article.author_name}</strong>
//           <span style={{ fontSize: '13px', color: '#777' }}>Published • {article.read_time}</span>
//         </div>
//       </div>

//       {article.cover_image && (
//         <img src={article.cover_image} alt={article.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '24px' }} />
//       )}

//       <div style={{ fontSize: '18px', lineHeight: 1.8, color: '#2D3748', whiteSpace: 'pre-line' }}>
//         {article.content}
//       </div>
//     </div>
//   );
// }