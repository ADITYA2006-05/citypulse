'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, User, Key, Mail, Building2, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from './LoginPage.module.css';

// Colored Google SVG G-Logo
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
    <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.579c1.32 0 2.507.454 3.439 1.346l2.58-2.58C13.463.896 11.426 0 9 0 5.485 0 2.443 2.039.957 4.961l3.007 2.332c.708-2.127 2.692-3.714 5.036-3.714z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'CITIZEN' | 'ADMIN'>('CITIZEN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Google Auth Simulation states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (role === 'CITIZEN' && !name) {
      setError('Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API credentials login
    setTimeout(() => {
      if (role === 'ADMIN') {
        if (email === 'admin@citypulse.gov' && password === 'admin123') {
          login('Director Sterling', email, 'ADMIN');
        } else {
          setError('Invalid administrator credentials. Try: admin@citypulse.gov / admin123');
          setIsSubmitting(false);
        }
      } else {
        login(name, email, 'CITIZEN');
      }
    }, 800);
  };

  // Triggers the Google Auth flow
  const handleGoogleSignInClick = async () => {
    setError('');
    // Check if we are running in real environment
    const hasRealGoogleKeys = 
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && 
      !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes('dummy');

    if (hasRealGoogleKeys) {
      // Trigger real OAuth login using next-auth
      try {
        setIsGoogleSigningIn(true);
        await signIn('google');
      } catch (err) {
        console.error('Error starting Google Auth:', err);
        setError('Failed to contact Google servers. Launching mock portal instead.');
        setIsGoogleSigningIn(false);
        setShowGoogleModal(true);
      }
    } else {
      // Launch our high-fidelity simulation account picker
      setShowGoogleModal(true);
    }
  };

  // Simulates selecting a Google account
  const handleSelectGoogleAccount = (accName: string, accEmail: string) => {
    setSelectedGoogleAccount(accEmail);
    setIsGoogleSigningIn(true);

    // Simulate 1s Google loading redirect
    setTimeout(() => {
      login(accName, accEmail, 'CITIZEN');
      setIsGoogleSigningIn(false);
      setShowGoogleModal(false);
      setSelectedGoogleAccount(null);
    }, 1200);
  };

  const handleQuickLoad = (selectedRole: 'CITIZEN' | 'ADMIN') => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'ADMIN') {
      setEmail('admin@citypulse.gov');
      setPassword('admin123');
      setName('');
    } else {
      setName('Alex Rivera');
      setEmail('alex.rivera@gmail.com');
      setPassword('citizen123');
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Background neon blobs */}
      <div className={styles.bgBlobCyan}></div>
      <div className={styles.bgBlobPurple}></div>

      {/* Main glass box container */}
      <div className={`${styles.loginBox} glass-panel`}>
        {/* Branding header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.pulseDot}></span>
            <span className={styles.logoText}>City<span className={styles.logoAccent}>Pulse</span></span>
          </div>
          <p className={styles.subtitle}>Smart Municipal Services Portal</p>
        </div>

        {/* Tab sliding controller */}
        <div className={styles.tabContainer}>
          <button 
            type="button"
            className={`${styles.tabBtn} ${role === 'CITIZEN' ? styles.activeTab : ''}`}
            onClick={() => { setRole('CITIZEN'); setError(''); }}
          >
            <User size={16} />
            <span>Citizen Sign In</span>
          </button>
          <button 
            type="button"
            className={`${styles.tabBtn} ${role === 'ADMIN' ? styles.activeTab : ''}`}
            onClick={() => { setRole('ADMIN'); setError(''); }}
          >
            <Shield size={16} />
            <span>City Official</span>
          </button>
          <div className={`${styles.tabSlider} ${role === 'ADMIN' ? styles.slideRight : ''}`}></div>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {role === 'CITIZEN' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={18} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{role === 'ADMIN' ? 'Official Email' : 'Email Address'}</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrapper}>
              <Key className={styles.inputIcon} size={18} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={role === 'ADMIN' ? 'btn-neon-purple' : 'btn-neon-cyan'}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            disabled={isSubmitting || isGoogleSigningIn}
          >
            {isSubmitting ? 'Authenticating...' : `Enter ${role === 'ADMIN' ? 'Official Dashboard' : 'Reporting Hub'}`}
          </button>
        </form>

        {/* Citizen Google Provider Authentication divider */}
        {role === 'CITIZEN' && (
          <div className={styles.googleDividerArea}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or continue with</span>
            <div className={styles.dividerLine}></div>
          </div>
        )}

        {role === 'CITIZEN' && (
          <button 
            type="button" 
            onClick={handleGoogleSignInClick} 
            className={styles.googleBtn}
            disabled={isSubmitting || isGoogleSigningIn}
          >
            {isGoogleSigningIn ? (
              <Loader2 size={16} className={styles.spinIcon} />
            ) : (
              <GoogleLogo />
            )}
            <span>Sign In with Google</span>
          </button>
        )}

        {/* Quick Testing Options */}
        <div className={styles.demoSection}>
          <span className={styles.demoLabel}>Quick Demo Accounts:</span>
          <div className={styles.demoBtnGroup}>
            <button 
              type="button" 
              className={styles.demoBtn}
              onClick={() => handleQuickLoad('CITIZEN')}
            >
              <User size={12} />
              <span>Load Citizen Demo</span>
            </button>
            <button 
              type="button" 
              className={styles.demoBtn}
              onClick={() => handleQuickLoad('ADMIN')}
            >
              <Shield size={12} />
              <span>Load Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Footer info links */}
        <div className={styles.footerLinks}>
          <div className={styles.footerLink}>
            <Building2 size={12} />
            <span>Smart City Infrastructure Dept.</span>
          </div>
          <div className={styles.footerLink}>
            <HelpCircle size={12} />
            <span>Access Support</span>
          </div>
        </div>
      </div>

      {/* --- Simulated Google Accounts Chooser Modal --- */}
      {showGoogleModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.googleModal} glass-panel`}>
            {/* Modal Header */}
            <div className={styles.googleModalHeader}>
              <GoogleLogo />
              <h3>Sign in with Google</h3>
              <p>Choose an account to continue to <strong>CityPulse Smart Portal</strong></p>
            </div>

            {/* List of Simulated Google Accounts */}
            <div className={styles.googleAccountsList}>
              {[
                { name: 'Alex Rivera', email: 'alex.rivera@gmail.com', avatar: 'AR', color: '#00f2fe' },
                { name: 'Chloe Sterling', email: 'chloe.s@gmail.com', avatar: 'CS', color: '#ff007f' },
                { name: 'Marcus Vance', email: 'marcus.vance@gmail.com', avatar: 'MV', color: '#8a2be2' }
              ].map(acc => {
                const isSelected = selectedGoogleAccount === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    className={`${styles.googleAccountItem} ${isGoogleSigningIn ? styles.disabledItem : ''}`}
                    onClick={() => handleSelectGoogleAccount(acc.name, acc.email)}
                    disabled={isGoogleSigningIn}
                  >
                    {isSelected && isGoogleSigningIn ? (
                      <div className={styles.itemSpinnerWrap}>
                        <Loader2 size={18} className={styles.spinIcon} />
                      </div>
                    ) : (
                      <div className={styles.googleAvatar} style={{ background: `${acc.color}22`, borderColor: acc.color, color: acc.color }}>
                        {acc.avatar}
                      </div>
                    )}
                    <div className={styles.googleAccountInfo}>
                      <span className={styles.googleAccountName}>{acc.name}</span>
                      <span className={styles.googleAccountEmail}>{acc.email}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer warning */}
            <div className={styles.googleModalFooter}>
              <AlertCircle size={14} className={styles.footerAlertIcon} />
              <p>Developer Simulation. Real credentials are not sent to Google.</p>
              <button 
                type="button" 
                onClick={() => setShowGoogleModal(false)}
                className={styles.modalCloseBtn}
                disabled={isGoogleSigningIn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
