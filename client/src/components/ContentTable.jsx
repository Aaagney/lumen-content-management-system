import React from 'react';
import { Link } from 'react-router-dom';

const ContentTable = ({ items, onDeleteClick }) => {
  return (
    <div className="table-container">
      <table className="content-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Author</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>#{item.id}</td>
              <td><strong>{item.title}</strong></td>
              <td>{item.category}</td>
              <td>{item.author}</td>
              <td>
                <span className={`badge ${item.status === 'Published' ? 'badge-published' : 'badge-draft'}`}>
                  {item.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/content/view/${item.id}`} style={{ color: '#4b5563', fontSize: '0.85rem' }}>View</Link>
                  <Link to={`/content/edit/${item.id}`} style={{ color: 'var(--brand-green)', fontSize: '0.85rem' }}>Edit</Link>
                  <button onClick={() => onDeleteClick(item)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContentTable;