import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { API_ENDPOINTS } from '../config/api';

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
          axios.get(`${API_ENDPOINTS.USERS}/${targetUserId}`).catch(() => ({ data: { name: `Author #${targetUserId}`, role: 'Author', bio: 'Content Creator' } })),
          axios.get(`${API_ENDPOINTS.USERS}/${targetUserId}/articles`).catch(() => ({ data: [] }))
        ]);
        
        setProfile(profileRes.data);
        setArticles(articlesRes.data || []);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [targetUserId]);

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}><p>Loading profile...</p></div>;
  if (!profile) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}><p>User not found.</p></div>;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '30px', borderBottom: '1px solid #eee', marginBottom: '40px' }}>
        <img 
          src={profile.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'} 
          alt={`${profile.name}'s avatar`} 
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>
            {profile.name} <span style={{fontSize: '14px', fontWeight: 'normal', color: '#666', background: '#eee', padding: '4px 8px', borderRadius: '12px', textTransform: 'capitalize'}}>{profile.role || 'Author'}</span>
          </h1>
          <p style={{ margin: '0 0 8px 0', color: '#555', lineHeight: '1.5' }}>{profile.bio || 'Author on Lumen CMS.'}</p>
        </div>
      </div>

      <h2>Articles by {profile.name}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {articles.length > 0 ? (
          articles.map(article => <ArticleCard key={article.id || article._id} article={article} />)
        ) : (
          <p style={{ color: '#777' }}>No articles published yet.</p>
        )}
      </div>
    </div>
  );
}