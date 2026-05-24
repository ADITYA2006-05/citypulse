'use client';

import { Activity, CheckCircle2, Heart, Award } from 'lucide-react';
import styles from './StatsWidget.module.css';

interface StatsWidgetProps {
  reports: Array<{
    status: string;
    upvotes: number;
  }>;
}

export default function StatsWidget({ reports }: StatsWidgetProps) {
  const total = reports.length;
  const active = reports.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
  const resolved = reports.filter(r => r.status === 'RESOLVED').length;
  const totalUpvotes = reports.reduce((acc, r) => acc + r.upvotes, 0);
  
  // Calculate resolution rate
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className={styles.statsGrid}>
      {/* Total Active Issues */}
      <div className={`${styles.statCard} glass-panel glass-panel-glow-cyan`}>
        <div className={`${styles.iconContainer} ${styles.cyan}`}>
          <Activity size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.label}>Active Reports</span>
          <h3 className={`${styles.value} ${styles.cyanGlow}`}>{active}</h3>
          <span className={styles.trend}>Needs Attention</span>
        </div>
      </div>

      {/* Resolved Issues */}
      <div className={`${styles.statCard} glass-panel glass-panel-glow-cyan`}>
        <div className={`${styles.iconContainer} ${styles.green}`}>
          <CheckCircle2 size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.label}>Resolved</span>
          <h3 className={`${styles.value} ${styles.greenGlow}`}>{resolved}</h3>
          <span className={styles.trend}>Issues Fixed</span>
        </div>
      </div>

      {/* Upvotes / Community Support */}
      <div className={`${styles.statCard} glass-panel glass-panel-glow-purple`}>
        <div className={`${styles.iconContainer} ${styles.pink}`}>
          <Heart size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.label} style={{ fontSize: '0.8rem' }}>Community Support</span>
          <h3 className={`${styles.value} ${styles.pinkGlow}`}>{totalUpvotes}</h3>
          <span className={styles.trend}>Citizens Engaged</span>
        </div>
      </div>

      {/* Resolution Rate */}
      <div className={`${styles.statCard} glass-panel glass-panel-glow-purple`}>
        <div className={`${styles.iconContainer} ${styles.purple}`}>
          <Award size={24} />
        </div>
        <div className={styles.statContent}>
          <span className={styles.label}>Resolution Rate</span>
          <h3 className={`${styles.value} ${styles.purpleGlow}`}>{resolutionRate}%</h3>
          <span className={styles.trend}>Overall Efficiency</span>
        </div>
      </div>
    </div>
  );
}
