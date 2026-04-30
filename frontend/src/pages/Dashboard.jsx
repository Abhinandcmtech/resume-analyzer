import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadialBarChart, RadialBar, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import api from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetJob, setTargetJob] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/resume/history');
      setHistory(data);
    } catch {
      /* silently skip on 401 */
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !targetJob) { setError('Please provide a PDF and target job.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('target_job', targetJob);
      if (jobDescription.trim()) fd.append('job_description', jobDescription.trim());
      const { data } = await api.post('/resume/upload', fd);
      setResult(data.result);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreData = result ? [{ name: 'Score', value: result.match_score, fill: '#38bdf8' }] : [];
  const skillBarData = result
    ? [
        { name: 'Matched', count: result.matched_skills.length, fill: '#34d399' },
        { name: 'Missing', count: result.missing_skills.length, fill: '#f87171' },
        { name: 'Extracted', count: result.extracted_skills.length, fill: '#a78bfa' },
      ]
    : [];

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Resume Analyzer</h2>

      <div style={styles.card}>
        <h3 style={styles.sub}>Upload Resume</h3>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleUpload}>
          <input
            style={styles.input} type="text" placeholder="Target Job (e.g. Software Engineer)"
            value={targetJob} onChange={(e) => setTargetJob(e.target.value)} required
          />
          <textarea
            style={{ ...styles.input, height: '120px', resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Paste job description here (optional — improves accuracy)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <input
            style={{ ...styles.input, cursor: 'pointer' }} type="file" accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])} required
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Analyzing…' : 'Analyze Resume'}
          </button>
        </form>
      </div>

      {result && (
        <div style={styles.resultsGrid}>
          <div style={styles.card}>
            <h3 style={styles.sub}>Match Score</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={8} background />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p style={styles.scoreLabel}>{result.match_score}%</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sub}>Skill Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={skillBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {skillBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
            <h3 style={styles.sub}>Missing Skills</h3>
            <div style={styles.tagRow}>
              {result.missing_skills.length === 0
                ? <span style={styles.allGood}>All required skills found!</span>
                : result.missing_skills.map((s) => (
                    <span key={s} style={styles.tagRed}>{s}</span>
                  ))}
            </div>
            <h3 style={{ ...styles.sub, marginTop: '1rem' }}>Matched Skills</h3>
            <div style={styles.tagRow}>
              {result.matched_skills.map((s) => (
                <span key={s} style={styles.tagGreen}>{s}</span>
              ))}
            </div>
          </div>

          {result.suggestions && result.suggestions.length > 0 && (
            <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
              <h3 style={styles.sub}>Actionable Suggestions</h3>
              <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {result.suggestions.map((s, i) => (
                  <li key={i} style={styles.suggestion}>{s}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.sub}>Past Submissions</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Job', 'File', 'Date', 'Score'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(({ submission, result: r }) => (
                <tr key={submission._id}>
                  <td style={styles.td}>{submission.target_job}</td>
                  <td style={styles.td}>{submission.filename}</td>
                  <td style={styles.td}>{new Date(submission.uploaded_at).toLocaleDateString()}</td>
                  <td style={{ ...styles.td, color: '#38bdf8', fontWeight: 700 }}>
                    {r ? `${r.match_score}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', color: '#f1f5f9' },
  heading: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' },
  sub: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.8rem', color: '#cbd5e1' },
  card: { background: '#1e293b', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  input: { display: 'block', width: '100%', padding: '0.65rem 0.85rem', marginBottom: '0.8rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn: { padding: '0.7rem 2rem', background: '#38bdf8', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#f87171', marginBottom: '0.8rem', fontSize: '0.9rem' },
  resultsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
  scoreLabel: { textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#38bdf8', marginTop: '-0.5rem' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  tagRed: { background: '#7f1d1d', color: '#fca5a5', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem' },
  tagGreen: { background: '#14532d', color: '#86efac', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem' },
  allGood: { color: '#34d399', fontSize: '0.95rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.6rem 0.75rem', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.85rem' },
  td: { padding: '0.6rem 0.75rem', borderBottom: '1px solid #1e293b', fontSize: '0.9rem', color: '#cbd5e1' },
  suggestion: { color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '0.4rem' },
};
