'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import IssueCard, { IssueReport, CATEGORIES } from '@/components/IssueCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ArrowLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import Link from 'next/link';
import styles from './Admin.module.css';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Data states
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ALL'>('ALL');

  // Load issues
  const loadReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) throw new Error('Failed to load reports');
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Could not connect to the database. Running in mock state.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadReports();
    }
  }, [user]);

  // Handle administrator status updates
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      // Update local state dynamically
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Auth gate - must be ADMIN
  if (!user || user.role !== 'ADMIN') {
    return (
      <main className={styles.mainContainer}>
        <Navbar />
        <div className={styles.authWrapper}>
          <div className={`${styles.authBox} glass-panel pulse-glow-red`}>
            <div className={styles.lockIconContainer}>
              <ShieldAlert size={40} className={styles.lockIcon} />
            </div>
            <h2>Administrative Workspace Restricted</h2>
            <p>Access to municipal operations requires verification credentials. Please log in with a City Official account.</p>
            <div className={styles.authActions}>
              <Link href="/login" className="btn-neon-purple">
                <span>Access Portals</span>
                <ChevronRight size={16} />
              </Link>
              <Link href="/" className="btn-secondary">
                <span>Back to Community Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Filter lists based on selected tabs
  const filteredReports = activeTab === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === activeTab);

  // --- Analytical Calculations ---
  
  // 1. Bar Chart: Reports by Category
  const categoryCounts = Object.keys(CATEGORIES).reduce((acc, key) => {
    acc[key] = { name: CATEGORIES[key].label.split(' ')[0], count: 0 };
    return acc;
  }, {} as Record<string, { name: string; count: number }>);

  reports.forEach(r => {
    if (categoryCounts[r.category]) {
      categoryCounts[r.category].count += 1;
    }
  });
  
  const barChartData = Object.values(categoryCounts);

  // 2. Pie Chart: Resolution Pipeline Status
  const statusData = [
    { name: 'Pending Review', value: reports.filter(r => r.status === 'PENDING').length, color: '#ff5e62' },
    { name: 'In Progress', value: reports.filter(r => r.status === 'IN_PROGRESS').length, color: '#ff9900' },
    { name: 'Resolved', value: reports.filter(r => r.status === 'RESOLVED').length, color: '#39ff14' }
  ].filter(s => s.value > 0); // Don't show empty statuses

  return (
    <main className={styles.mainContainer}>
      <Navbar />

      <div className={styles.contentWrapper}>
        {/* Header Title */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Operations <span className={styles.gradientText}>Command Center</span>
            </h1>
            <p className={styles.subtitle}>Supervise civic reports, examine infrastructural analytics, and update work orders.</p>
          </div>
          <button onClick={loadReports} className="btn-secondary" style={{ height: '44px' }}>
            <Database size={16} />
            <span>Sync Live Feed</span>
          </button>
        </div>

        {/* --- Analytics Graphs Grid --- */}
        <section className={styles.analyticsSection}>
          <div className={styles.chartsGrid}>
            {/* Bar Chart Panel */}
            <div className={`${styles.chartCard} glass-panel`}>
              <h3 className={styles.chartTitle}>Incidents by Civic Category</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0d111e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f1f5f9' }}
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    />
                    <Bar dataKey="count" fill="url(#cyanGlowGrad)" radius={[4, 4, 0, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#cyanGlowGrad)" />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="cyanGlowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#7f00ff" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart Panel */}
            <div className={`${styles.chartCard} glass-panel`}>
              <h3 className={styles.chartTitle}>Resolution Pipeline Status</h3>
              <div className={styles.chartContainer}>
                {statusData.length === 0 ? (
                  <div className={styles.noChartData}>No active statistics available yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0d111e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f1f5f9' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        iconType="circle" 
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- Work Order Workflow List --- */}
        <section className={styles.workflowSection}>
          <div className={styles.workflowHeader}>
            <h2 className={styles.workflowTitle}>Operational Flow Pipeline</h2>
            
            {/* Filter Tabs */}
            <div className={styles.tabGroup}>
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab.replace('_', ' ')}
                  <span className={styles.tabCount}>
                    ({tab === 'ALL' 
                      ? reports.length 
                      : reports.filter(r => r.status === tab).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow reports grid */}
          {isLoading ? (
            <div className={styles.stateContainer}>
              <div className={styles.spinner}></div>
              <p>Syncing municipal database...</p>
            </div>
          ) : error ? (
            <div className={`${styles.errorAlert} glass-panel`}>
              <AlertCircle className={styles.alertIcon} size={20} />
              <span>{error}</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className={`${styles.emptyState} glass-panel`}>
              <CheckCircle2 size={48} className={styles.emptyIcon} />
              <h3>All clear in this section!</h3>
              <p>No civic reports fall under this queue category currently.</p>
            </div>
          ) : (
            <div className={styles.workflowGrid}>
              {filteredReports.map(report => (
                <div key={report.id} className={styles.gridItem}>
                  <IssueCard 
                    report={report} 
                    isAdminView={true}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
