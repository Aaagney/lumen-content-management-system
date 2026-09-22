import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from '../components/ArticleCard';
import { Flag } from 'lucide-react';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const targetUserId = userId || (currentUser ? currentUser.id : 1);
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reporting State
  const [reportingUser, setReportingUser] = useState(false);

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

  const isSelf = currentUser && currentUser.id === profile.id;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', paddingBottom: '30px', borderBottom: '1px solid #eee', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <img 
            src={profile.avatar || 'https://via.placeholder.com/120?text=User'} 
            alt={`${profile.name}'s avatar`} 
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>
              {profile.name}{' '}
              <span style={{fontSize: '13px', fontWeight: 'normal', color: '#666', background: '#eee', padding: '3px 8px', borderRadius: '12px', textTransform: 'capitalize'}}>
                {profile.role}
              </span>
            </h1>
            <p style={{ margin: '0 0 8px 0', color: '#555', lineHeight: '1.5', fontSize: '14px', maxWidth: '500px' }}>
              {profile.bio || 'Author on Lumen Content Management System.'}
            </p>
          </div>
        </div>

        {/* Report User Action (only if not viewing self) */}
        {!isSelf && (
          <button
            className="btn-report"
            onClick={() => setReportingUser(true)}
            title="Report this user"
          >
            <Flag size={14} />
            <span>Report User</span>
          </button>
        )}
      </div>

      <h2>Articles by {profile.name}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {articles.length > 0 ? (
          articles.map(article => <ArticleCard key={article.id} article={article} />)
        ) : (
          <p style={{ color: '#777' }}>No articles published yet.</p>
        )}
      </div>

      {reportingUser && (
        <ReportModal
          isOpen={reportingUser}
          onClose={() => setReportingUser(false)}
          targetType="user"
          targetId={profile.id}
          targetTitle={profile.name}
        />
      )}
    </div>
  );
}