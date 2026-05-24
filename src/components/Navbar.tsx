'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, MapPin, PlusCircle, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't render Navbar on login page
  if (pathname === '/login') return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`${styles.navbar} glass-panel`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={() => setMobileMenuOpen(false)}>
          <span className={styles.pulseDot}></span>
          <span className={styles.logoText}>City<span className={styles.logoAccent}>Pulse</span></span>
        </Link>

        {/* Desktop Links */}
        <div className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            <MapPin size={16} />
            <span>Community Dashboard</span>
          </Link>
          
          <Link 
            href="/reports/new" 
            className={`${styles.navLink} ${isActive('/reports/new') ? styles.active : ''}`}
          >
            <PlusCircle size={16} />
            <span>Report Issue</span>
          </Link>

          {user?.role === 'ADMIN' && (
            <Link 
              href="/admin" 
              className={`${styles.navLink} ${styles.adminLink} ${isActive('/admin') ? styles.activeAdmin : ''}`}
            >
              <Shield size={16} />
              <span>Admin Workspace</span>
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userProfile}>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>{user.role === 'ADMIN' ? 'City Official' : 'Citizen'}</span>
              </div>
              <button onClick={logout} className={styles.logoutBtn} title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-neon-cyan" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
              <User size={16} />
              <span>Portal Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuToggle} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link 
            href="/" 
            className={`${styles.mobileNavLink} ${isActive('/') ? styles.mobileActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MapPin size={18} />
            <span>Community Dashboard</span>
          </Link>
          
          <Link 
            href="/reports/new" 
            className={`${styles.mobileNavLink} ${isActive('/reports/new') ? styles.mobileActive : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <PlusCircle size={18} />
            <span>Report Issue</span>
          </Link>

          {user?.role === 'ADMIN' && (
            <Link 
              href="/admin" 
              className={`${styles.mobileNavLink} ${styles.mobileAdminLink} ${isActive('/admin') ? styles.mobileActiveAdmin : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield size={18} />
              <span>Admin Workspace</span>
            </Link>
          )}

          <div className={styles.mobileUserArea}>
            {user ? (
              <div className={styles.mobileUserWrap}>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileUserName}>{user.name}</div>
                  <div className={styles.mobileUserRole}>{user.role === 'ADMIN' ? 'City Official' : 'Citizen'}</div>
                </div>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className={styles.mobileLogoutBtn}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="btn-neon-cyan" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={16} />
                <span>Portal Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
