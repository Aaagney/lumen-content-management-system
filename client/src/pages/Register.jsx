import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reader');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(fullname, email, password, role);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '48px' }}>
      <h1>Create an account</h1>
      <p style={{ color: '#666' }}>
        Join as a reader — you can start writing once you're in.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Full name</label>
        <input
          type="text"
          className="input-field"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label>Password</label>
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <label>Account type</label>
        <select className="select-field" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="reader">Reader — read and comment</option>
          <option value="author">Author — also write articles</option>
        </select>

        {error && <p style={{ color: 'crimson', fontSize: '14px', marginTop: '-8px' }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
