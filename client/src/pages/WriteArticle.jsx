import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function WriteArticle() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    if (editId) {
      axios.get(`http://localhost:5000/api/articles/${editId}`)
        .then(res => {
          setTitle(res.data.title);
          setSubtitle(res.data.subtitle || '');
          setCategoryId(res.data.category_id || 1);
          setContent(res.data.content);
          setCoverImage(res.data.cover_image || '');
        })
        .catch(err => {
          console.error("Failed to fetch article:", err);
          alert("Could not load the article for editing.");
        });
    }
  }, [editId]);

  const handleSubmit = (status) => {
    // Parse categoryId as an integer to prevent MySQL type errors
    const payload = { 
      title, 
      subtitle, 
      category_id: parseInt(categoryId), 
      content, 
      cover_image: coverImage, 
      author_id: 1, 
      status 
    };

    if (editId) {
      axios.put(`http://localhost:5000/api/articles/${editId}`, payload)
        .then(() => navigate('/profile'))
        .catch(error => {
          console.error('Server failed to update:', error);
          alert('Failed to update article. Check your backend VS Code terminal for the exact MySQL error.');
        });
    } else {
      axios.post('http://localhost:5000/api/articles', payload)
        .then(() => navigate('/profile'))
        .catch(error => {
          console.error('Server failed to save:', error);
          alert('Failed to save article. Check your backend VS Code terminal for the exact MySQL error.');
        });
    }
  };

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <h1>{editId ? 'Edit Article' : 'New Article'}</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Draft your post and submit for review once ready.</p>

      <label>Title</label>
      <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter article title..." />

      <label>Subtitle / Excerpt</label>
      <input type="text" className="input-field" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Short summary..." />

      <label>Category</label>
      <select className="select-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value={1}>Science</option>
        <option value={2}>Technology</option>
        <option value={3}>Environment</option>
        <option value={4}>Health</option>
        <option value={5}>History</option>
      </select>

      <label>Cover Image URL</label>
      <input type="text" className="input-field" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />

      <label>Content</label>
      <textarea className="textarea-field" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your full story here..."></textarea>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button className="btn btn-secondary" onClick={() => handleSubmit('Draft')}>Save Draft</button>
        <button className="btn btn-primary" onClick={() => handleSubmit('Pending Review')}>Submit for Review</button>
      </div>
    </div>
  );
}