import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data = await adminApi.login(email, password);
      login(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Invalid admin credentials. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-top-bar">
        <button className="login-theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'dark' ? <Sun size={18} className="icon-sun" /> : <Moon size={18} className="icon-moon" />}
        </button>
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-circle">
              <ShieldCheck size={24} />
            </div>
            <h2>Admin Sign In</h2>
            <p>Access the control center to manage workers, approvals, customers & jobs</p>
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-login-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
