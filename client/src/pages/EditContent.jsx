import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchContentById, updateContent } from '../services/api';

const EditContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    author: '',
    status: 'Draft',
    read_time: '5 min read',
    image_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        const res = await fetchContentById(id);
        if (res.success) {
          setFormData(res.data);
        }
      } catch (err) {
        setError('Failed to load item.');
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateContent(id, formData);
      if (res.success) {
        navigate('/content');
      }
    } catch (err) {
      setError('Update failed.');
    }
  };

  if (loading) return <div className="main-content"><p>Loading...</p></div>;

  return (
    <div className="main-content">
      <div className="actions-bar">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem' }}>Edit Article #{id}</h1>
        <Link to="/content" className="btn-secondary">Cancel</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
              <option value="Science">Science</option>
              <option value="Technology">Technology</option>
              <option value="Environment">Environment</option>
              <option value="Health">Health</option>
              <option value="History">History</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Author Name *</label>
            <input type="text" name="author" className="form-control" value={formData.author} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Read Time</label>
            <input type="text" name="read_time" className="form-control" value={formData.read_time} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input type="text" name="image_url" className="form-control" value={formData.image_url} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Status *</label>
            <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Excerpt / Description *</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-green">Update Content</button>
        </form>
      </div>
    </div>
  );
};

export default EditContent;