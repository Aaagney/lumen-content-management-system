import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';

export default function Profile() {
  const { userId } = useParams();
  const targetUserId = userId || 1; // Defaults to user 1 if visiting /profile directly
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [profileRes, articlesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${targetUserId}`),
          axios.get(`http://localhost:5000/api/users/${targetUserId}/articles`)
        ]);
        
        setProfile(profileRes.data);
        setArticles(articlesRes.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [targetUserId]);


  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (!profile) return <div style={{ textAlign: 'center', marginTop: '50px' }}>User not found.</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '30px', borderBottom: '1px solid #eee', marginBottom: '40px' }}>
        <img 
          src={profile.avatar || 'https://via.placeholder.com/120?text=User'} 
          alt={`${profile.name}'s avatar`} 
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>{profile.name} <span style={{fontSize: '14px', fontWeight: 'normal', color: '#666', background: '#eee', padding: '4px 8px', borderRadius: '12px', textTransform: 'capitalize'}}>{profile.role}</span></h1>
          <p style={{ margin: '0 0 8px 0', color: '#555', lineHeight: '1.5' }}>{profile.bio}</p>
        </div>
      </div>

      <h2>Articles by {profile.name}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {articles.length > 0 ? (
          articles.map(article => <ArticleCard key={article.id} article={article} />)
        ) : (
          <p style={{ color: '#777' }}>No articles published yet.</p>
        )}
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Edit2, Trash2 } from 'lucide-react';

// export default function Profile() {
//   const [articles, setArticles] = useState([]);
//   const navigate = useNavigate();

//   const fetchUserArticles = () => {
//     axios.get('http://localhost:5000/api/articles/user/1')
//       .then(res => setArticles(res.data))
//       .catch(err => console.error(err));
//   };

//   useEffect(() => {
//     fetchUserArticles();
//   }, []);

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this article?')) {
//       axios.delete(`http://localhost:5000/api/articles/${id}`)
//         .then(() => fetchUserArticles());
//     }
//   };

//   return (
//     <div className="container">
//       <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', gap: '20px', alignItems: 'center' }}>
//         <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Avatar" style={{ width: '72px', height: '72px', borderRadius: '50%' }} />
//         <div>
//           <h2 style={{ margin: 0 }}>Priya Mehta</h2>
//           <p style={{ color: '#666', margin: '4px 0 0 0' }}>Science communicator & neuroscientist.</p>
//         </div>
//       </div>

//       <h2 style={{ marginTop: '32px' }}>My Articles</h2>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//         {articles.map(art => (
//           <div key={art.id} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <div>
//               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                 <span className={`badge badge-${art.status.toLowerCase().replace(' ', '-')}`}>
//                   {art.status}
//                 </span>
//                 <span style={{ fontSize: '13px', color: '#888' }}>{art.category_name}</span>
//               </div>
//               <h3 style={{ margin: '8px 0 0 0', fontSize: '18px' }}>{art.title}</h3>
//             </div>
//             <div style={{ display: 'flex', gap: '8px' }}>
//               <button className="btn btn-secondary" onClick={() => navigate(`/write?edit=${art.id}`)}>
//                 <Edit2 size={16} />
//               </button>
//               <button className="btn btn-secondary" style={{ color: 'crimson' }} onClick={() => handleDelete(art.id)}>
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }