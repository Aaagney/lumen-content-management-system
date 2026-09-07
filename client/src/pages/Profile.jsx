import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';

export default function Profile() {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  const fetchUserArticles = () => {
    axios.get('http://localhost:5000/api/articles/user/1')
      .then(res => setArticles(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUserArticles();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      axios.delete(`http://localhost:5000/api/articles/${id}`)
        .then(() => fetchUserArticles());
    }
  };

  return (
    <div className="container">
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Avatar" style={{ width: '72px', height: '72px', borderRadius: '50%' }} />
        <div>
          <h2 style={{ margin: 0 }}>Priya Mehta</h2>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>Science communicator & neuroscientist.</p>
        </div>
      </div>

      <h2 style={{ marginTop: '32px' }}>My Articles</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {articles.map(art => (
          <div key={art.id} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${art.status.toLowerCase().replace(' ', '-')}`}>
                  {art.status}
                </span>
                <span style={{ fontSize: '13px', color: '#888' }}>{art.category_name}</span>
              </div>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '18px' }}>{art.title}</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => navigate(`/write?edit=${art.id}`)}>
                <Edit2 size={16} />
              </button>
              <button className="btn btn-secondary" style={{ color: 'crimson' }} onClick={() => handleDelete(art.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}