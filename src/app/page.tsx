'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StatsWidget from '@/components/StatsWidget';
import IssueCard, { CATEGORIES, IssueReport } from '@/components/IssueCard';
import { Search, MapPin, Plus, ListFilter, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './Home.module.css';

export default function Home() {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IssueReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch reports on mount
  useEffect(() => {
    async function loadReports() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reports');
        if (!response.ok) throw new Error('Failed to load reports');
        const data = await response.json();
        setReports(data);
        setFilteredReports(data);
      } catch (err) {
        console.error('Error loading reports:', err);
        setError('Could not connect to the database. Running in mock state.');
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, []);

  // Filter reports locally when search query, status, or category changes
  useEffect(() => {
    let result = [...reports];

    if (selectedCategory !== 'ALL') {
      result = result.filter(r => r.category === selectedCategory);
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter(r => r.status === selectedStatus);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query)
      );
    }

    setFilteredReports(result);
  }, [searchQuery, selectedCategory, selectedStatus, reports]);

  return (
    <main className={styles.mainContainer}>
      <Navbar />
      
      <div className={styles.contentWrapper}>
        {/* Glowing Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroGlow}></div>
          <div className={styles.heroContent}>
            <div className={styles.badgeLine}>
              <span className={styles.badgeLineText}>Smart Infrastructure Portal</span>
              <ArrowUpRight size={14} className={styles.badgeLineIcon} />
            </div>
            <h1 className={styles.heroTitle}>
              Empower Your Neighborhood <br />
              <span className={styles.gradientText}>Citizen-Driven Action</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Spot a civic issue? Report it instantly. Help city officials map, coordinate, and resolve potholes, broken street lights, and waste management hazards.
            </p>
            <div className={styles.heroActions}>
              <Link href="/reports/new" className="btn-neon-cyan">
                <Plus size={20} />
                <span>Register a Problem</span>
              </Link>
              <a href="#board" className="btn-secondary">
                <span>View Dashboard</span>
              </a>
            </div>
          </div>
        </section>

        {/* Global Statistics Panel */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionHeading}>Live City Metrics</h2>
          <StatsWidget reports={reports} />
        </section>

        {/* Community Board / Filterable Issue Feed */}
        <section id="board" className={styles.boardSection}>
          <div className={styles.boardHeader}>
            <div>
              <h2 className={styles.sectionHeading}>Active Concerns Board</h2>
              <p className={styles.sectionSubheading}>Track issues lodged by fellow residents or upvote to raise urgency.</p>
            </div>
          </div>

          {/* Search and Filters Hub */}
          <div className={`${styles.filterHub} glass-panel`}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={18} />
              <input 
                type="text" 
                placeholder="Search issues by name, description, address..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className={styles.filtersGroup}>
              {/* Category Filter */}
              <div className={styles.filterDropdownWrapper}>
                <ListFilter size={14} className={styles.dropdownIcon} />
                <select 
                  className={styles.filterSelect}
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className={styles.filterDropdownWrapper}>
                <Clock size={14} className={styles.dropdownIcon} />
                <select 
                  className={styles.filterSelect}
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loaders, Errors and Grid list */}
          {isLoading ? (
            <div className={styles.stateContainer}>
              <div className={styles.spinner}></div>
              <p>Fetching active city reports...</p>
            </div>
          ) : error ? (
            <div className={`${styles.errorAlert} glass-panel`}>
              <AlertCircle className={styles.alertIcon} size={20} />
              <span>{error}</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className={`${styles.emptyState} glass-panel`}>
              <MapPin size={48} className={styles.emptyIcon} />
              <h3>No matching reports found</h3>
              <p>Try modifying your filters or search keywords, or register a new concern in this category.</p>
              <Link href="/reports/new" className="btn-neon-cyan" style={{ marginTop: '16px' }}>
                <Plus size={16} />
                <span>Be the First to Report</span>
              </Link>
            </div>
          ) : (
            <div className={styles.reportsGrid}>
              {filteredReports.map(report => (
                <div key={report.id} className={styles.gridItem}>
                  <IssueCard report={report} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
