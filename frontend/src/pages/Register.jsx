import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input} type="text" placeholder="Full Name"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            style={styles.input} type="email" placeholder="Email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            required minLength={6}
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={styles.footer}>
          Have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' },
  card: { background: '#1e293b', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px' },
  title: { color: '#f1f5f9', marginBottom: '1.5rem', textAlign: 'center' },
  input: { display: 'block', width: '100%', padding: '0.65rem 0.85rem', marginBottom: '1rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '0.7rem', background: '#38bdf8', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' },
  footer: { color: '#94a3b8', textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem' },
  link: { color: '#38bdf8' },
};
