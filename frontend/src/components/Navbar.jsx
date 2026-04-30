import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>ResumeAnalyzer</Link>
      <div>
        {token ? (
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 2rem', background: '#1e293b', color: '#fff',
  },
  brand: { color: '#38bdf8', fontWeight: 700, fontSize: '1.2rem', textDecoration: 'none' },
  link: { color: '#cbd5e1', marginLeft: '1rem', textDecoration: 'none' },
  btn: {
    background: 'transparent', border: '1px solid #475569', color: '#cbd5e1',
    padding: '0.35rem 0.9rem', borderRadius: '6px', cursor: 'pointer',
  },
};
