'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/components/IssueCard';
import { 
  Plus, 
  MapPin, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  Lock,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import styles from './NewReport.module.css';

export default function NewReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('LOW');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // UI states
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Handle image upload and convert to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  // Mock Geolocation Detector
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setFormError('');
    
    // Simulate GPS fetch
    setTimeout(() => {
      const mockAddresses = [
        '742 Grand Boulevard, Metro Heights',
        '104 University Avenue, Technology Park',
        '882 Lexington Drive, Westside Commercial',
        '12 Parkside Lane, Greenview Residential'
      ];
      
      const randomIdx = Math.floor(Math.random() * mockAddresses.length);
      setAddress(mockAddresses[randomIdx]);
      setLatitude(40.7 + Math.random() * 0.1);
      setLongitude(-73.9 - Math.random() * 0.1);
      setIsDetectingLocation(false);
    }, 1200);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Submit report to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!category) {
      setFormError('Please select an issue category.');
      return;
    }

    if (!address) {
      setFormError('Please specify the location address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          severity,
          address,
          latitude,
          longitude,
          imageUrl,
          reporterName: user?.name || 'Anonymous Citizen',
          reporterEmail: user?.email || 'anonymous@citypulse.gov'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      // Redirect to community dashboard
      router.push('/');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setFormError(err.message || 'An error occurred during submission.');
      setIsSubmitting(false);
    }
  };

  // Protected route layout - Must be logged in to file a report
  if (!user) {
    return (
      <main className={styles.mainContainer}>
        <Navbar />
        <div className={styles.authWrapper}>
          <div className={`${styles.authBox} glass-panel pulse-glow-red`}>
            <div className={styles.lockIconContainer}>
              <Lock size={40} className={styles.lockIcon} />
            </div>
            <h2>Civic Access Restricted</h2>
            <p>To file a new street or infrastructure report, you must log in to verify your residency and citizen status.</p>
            <div className={styles.authActions}>
              <Link href="/login" className="btn-neon-cyan">
                <span>Portal Sign In</span>
                <ChevronRight size={16} />
              </Link>
              <Link href="/" className="btn-secondary">
                <span>View Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <Navbar />

      <div className={styles.contentWrapper}>
        <div className={styles.formLayout}>
          {/* Header titles */}
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>
              Register a <span className={styles.gradientText}>Civic Issue</span>
            </h1>
            <p className={styles.formSubtitle}>
              Ensure your community stays clean, functional, and safe. Lodging a report takes less than 2 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`${styles.mainForm} glass-panel`}>
            {formError && (
              <div className={styles.errorMessage}>
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Category Selection */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '14px' }}>1. Select Problem Category</label>
              <div className={styles.categoryGrid}>
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                  const Icon = cat.icon;
                  const isSelected = category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.categoryCard} glass-panel ${isSelected ? styles.categorySelected : ''}`}
                      style={isSelected ? { borderColor: cat.color, boxShadow: `0 0 12px ${cat.color}22` } : {}}
                      onClick={() => setCategory(key)}
                    >
                      <div 
                        className={styles.categoryIconCircle}
                        style={{ 
                          background: isSelected ? `${cat.color}22` : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isSelected ? cat.color : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? cat.color : 'var(--text-secondary)'
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <span className={styles.categoryName}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Issue Title & Description */}
            <div className={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">2. Problem Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Deep pothole in left lane"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>

              {/* Severity selection */}
              <div className="form-group" style={{ minWidth: '220px' }}>
                <label className="form-label">Priority Severity</label>
                <div className={styles.severityGroup}>
                  {['LOW', 'MEDIUM', 'HIGH'].map(sev => (
                    <button
                      key={sev}
                      type="button"
                      className={`${styles.severityBtn} ${severity === sev ? styles[`active${sev}`] : ''}`}
                      onClick={() => setSeverity(sev)}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea 
                className="form-textarea" 
                rows={4}
                placeholder="Describe the problem, its size, the hazard it creates, or specific landmarks to help repair crews locate it..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {/* 3. Location Specification */}
            <div className="form-group">
              <label className="form-label">3. Location Address</label>
              <div className={styles.locationInputGroup}>
                <div className={styles.addressWrapper}>
                  <MapPin className={styles.inputIcon} size={18} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '45px' }}
                    placeholder="Enter the nearest address, landmark, or intersection"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className={styles.gpsBtn}
                  disabled={isDetectingLocation}
                  title="Detect current location"
                >
                  <Compass size={18} className={isDetectingLocation ? styles.spinIcon : ''} />
                  <span>{isDetectingLocation ? 'Locating...' : 'GPS Auto-fill'}</span>
                </button>
              </div>
            </div>

            {/* 4. Photo upload drop-zone */}
            <div className="form-group">
              <label className="form-label">4. Attach Photo (Optional)</label>
              <div className={styles.uploadArea} onClick={triggerFileSelect}>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                {imageUrl ? (
                  <div className={styles.imagePreviewWrap} onClick={e => e.stopPropagation()}>
                    <img src={imageUrl} alt="Preview" className={styles.imagePreview} />
                    <button 
                      type="button" 
                      onClick={() => setImageUrl(null)}
                      className={styles.removeImageBtn}
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <Upload size={32} className={styles.uploadIcon} />
                    <h4>Click to upload issue photo</h4>
                    <p>Supported formats: JPG, PNG (Max 2MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className={styles.formActions}>
              <Link href="/" className="btn-secondary">
                <span>Cancel</span>
              </Link>
              <button 
                type="submit" 
                className="btn-neon-cyan"
                disabled={isSubmitting}
              >
                <Sparkles size={16} />
                <span>{isSubmitting ? 'Lodging Report...' : 'Lodge Report'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
