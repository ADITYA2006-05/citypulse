'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  MessageSquare, 
  User, 
  Hammer, 
  Sun, 
  Trash2, 
  Radio, 
  Droplet, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import styles from './IssueCard.module.css';

// Category Configuration
export const CATEGORIES: Record<string, { label: string; icon: any; color: string }> = {
  POTHOLE: { label: 'Roads & Potholes', icon: Hammer, color: '#1e7b78' },
  STREET_LIGHT: { label: 'Street Light Failures', icon: Sun, color: '#b8860b' },
  WASTE: { label: 'Waste Management', icon: Trash2, color: '#2b8c56' },
  TRAFFIC_SIGNAL: { label: 'Traffic & Signals', icon: Radio, color: '#7047c6' },
  WATER_LEAK: { label: 'Water & Leaks', icon: Droplet, color: '#2b78c5' },
  DAMAGE: { label: 'Public Property Damage', icon: AlertTriangle, color: '#df3b3b' },
  OTHER: { label: 'Other Common Issues', icon: HelpCircle, color: '#7a6b5c' }
};

export interface Comment {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface IssueReport {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  reporterName: string | null;
  reporterEmail: string | null;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

interface IssueCardProps {
  report: IssueReport;
  onStatusChange?: (id: string, newStatus: string) => void;
  isAdminView?: boolean;
}

export default function IssueCard({ report, onStatusChange, isAdminView = false }: IssueCardProps) {
  const [upvotes, setUpvotes] = useState(report.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [comments, setComments] = useState<Comment[]>(report.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categoryInfo = CATEGORIES[report.category] || CATEGORIES.OTHER;
  const CategoryIcon = categoryInfo.icon;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasUpvoted) return;

    try {
      setHasUpvoted(true);
      setUpvotes(prev => prev + 1);

      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' })
      });

      if (!response.ok) {
        throw new Error('Failed to save upvote');
      }
    } catch (error) {
      console.error('Error upvoting:', error);
      // Rollback
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const response = await fetch(`/api/reports/${report.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newComment,
          isAdmin: isAdminView
        })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const savedComment = await response.json();
      setComments(prev => [...prev, savedComment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Severity color maps
  const severityStyle = report.severity === 'HIGH' 
    ? styles.severityHigh 
    : report.severity === 'MEDIUM' 
      ? styles.severityMedium 
      : styles.severityLow;

  // Status color maps
  const statusStyle = report.status === 'RESOLVED' 
    ? styles.statusResolved 
    : report.status === 'IN_PROGRESS' 
      ? styles.statusInProgress 
      : styles.statusPending;

  return (
    <>
      <div 
        className={`${styles.card} glass-panel ${report.status === 'PENDING' && report.severity === 'HIGH' ? 'pulse-glow-red' : ''}`}
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <div className={styles.categoryBadge} style={{ borderColor: `${categoryInfo.color}33`, color: categoryInfo.color }}>
            <CategoryIcon size={14} />
            <span>{categoryInfo.label}</span>
          </div>
          <div className={styles.badgeGroup}>
            <span className={`${styles.badge} ${severityStyle}`}>
              {report.severity} Priority
            </span>
            <span className={`${styles.badge} ${statusStyle}`}>
              {report.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className={styles.cardContent}>
          <h4 className={styles.title}>{report.title}</h4>
          <p className={styles.description}>{report.description}</p>
          
          {report.imageUrl && (
            <div className={styles.imageContainer}>
              <img src={report.imageUrl} alt={report.title} className={styles.reportImage} />
            </div>
          )}

          <div className={styles.metaRow}>
            <div className={`${styles.metaItem} ${styles.mapLink}`} title="View location">
              <MapPin size={14} />
              <span>{report.address}</span>
            </div>
            <div className={styles.metaItem}>
              <Clock size={14} />
              <span>{new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className={styles.cardFooter} onClick={e => e.stopPropagation()}>
          <button 
            onClick={handleUpvote} 
            className={`${styles.upvoteBtn} ${hasUpvoted ? styles.upvoted : ''}`}
            disabled={hasUpvoted}
          >
            <ThumbsUp size={16} />
            <span>{upvotes} Support{upvotes === 1 ? '' : 's'}</span>
          </button>

          <button 
            onClick={() => setIsExpanding(!isExpanding)} 
            className={styles.commentToggleBtn}
          >
            <MessageSquare size={16} />
            <span>{comments.length} Discussion{comments.length === 1 ? '' : 's'}</span>
            {isExpanding ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Collapsible Discussion Section */}
        {isExpanding && (
          <div className={styles.discussionSection} onClick={e => e.stopPropagation()}>
            <div className={styles.commentsList}>
              {comments.length === 0 ? (
                <p className={styles.noComments}>No updates or comments yet. Start the conversation!</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className={`${styles.commentBubble} ${c.isAdmin ? styles.adminComment : ''}`}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentUser}>
                        <User size={12} />
                        {c.isAdmin ? 'City Official Response' : 'Community Member'}
                      </span>
                      <span className={styles.commentTime}>
                        {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={styles.commentText}>{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Submission Form */}
            <form onSubmit={handleAddComment} className={styles.commentForm}>
              <input 
                type="text" 
                placeholder={isAdminView ? "Submit official administrator update..." : "Add your comment or concern..."}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className={styles.commentInput}
                disabled={isSubmittingComment}
                required
              />
              <button 
                type="submit" 
                className="btn-neon-cyan" 
                style={{ padding: '8px 16px', fontSize: '0.85rem', height: '100%', borderRadius: '6px' }}
                disabled={isSubmittingComment}
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </form>

            {/* Admin Workflow Status Controls */}
            {isAdminView && onStatusChange && (
              <div className={styles.adminControls}>
                <span className={styles.adminControlLabel}>Change Status:</span>
                <div className={styles.adminBtnGroup}>
                  <button 
                    onClick={() => onStatusChange(report.id, 'PENDING')} 
                    className={`${styles.adminBtn} ${styles.pendingBtn} ${report.status === 'PENDING' ? styles.activePending : ''}`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => onStatusChange(report.id, 'IN_PROGRESS')} 
                    className={`${styles.adminBtn} ${styles.inProgressBtn} ${report.status === 'IN_PROGRESS' ? styles.activeInProgress : ''}`}
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => onStatusChange(report.id, 'RESOLVED')} 
                    className={`${styles.adminBtn} ${styles.resolvedBtn} ${report.status === 'RESOLVED' ? styles.activeResolved : ''}`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Mapping Detail Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)} title="Close Panel">
              <X size={20} />
            </button>

            <div className={styles.modalColumns}>
              {/* Left Side: Report Details and Discussion */}
              <div className={styles.modalLeftColumn}>
                <div className={styles.modalHeaderInfo}>
                  <div className={styles.categoryBadge} style={{ borderColor: `${categoryInfo.color}33`, color: categoryInfo.color }}>
                    <CategoryIcon size={14} />
                    <span>{categoryInfo.label}</span>
                  </div>
                  <div className={styles.badgeGroup}>
                    <span className={`${styles.badge} ${severityStyle}`}>
                      {report.severity} Priority
                    </span>
                    <span className={`${styles.badge} ${statusStyle}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h2 className={styles.modalTitle}>{report.title}</h2>
                
                <div className={styles.reporterMeta}>
                  <User size={14} className={styles.reporterIcon} />
                  <span>Reported by <strong>{report.reporterName || 'Anonymous Citizen'}</strong></span>
                </div>

                <p className={styles.modalDescription}>{report.description}</p>

                {report.imageUrl && (
                  <div className={styles.modalImageContainer}>
                    <img src={report.imageUrl} alt={report.title} className={styles.modalImage} />
                  </div>
                )}

                <div className={styles.modalMetaRow}>
                  <div className={styles.metaItem}>
                    <MapPin size={14} />
                    <span>{report.address}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={14} />
                    <span>Lodged on {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className={styles.modalActionsRow}>
                  <button 
                    onClick={handleUpvote} 
                    className={`${styles.upvoteBtn} ${hasUpvoted ? styles.upvoted : ''}`}
                    disabled={hasUpvoted}
                  >
                    <ThumbsUp size={16} />
                    <span>{upvotes} Support{upvotes === 1 ? '' : 's'}</span>
                  </button>
                </div>

                {/* Inside-Modal Discussion Thread */}
                <div className={styles.modalDiscussion}>
                  <h4 className={styles.discussionHeading}>Community Thread</h4>
                  
                  <div className={styles.modalCommentsList}>
                    {comments.length === 0 ? (
                      <p className={styles.noComments}>No updates or comments yet. Start the conversation!</p>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className={`${styles.commentBubble} ${c.isAdmin ? styles.adminComment : ''}`}>
                          <div className={styles.commentHeader}>
                            <span className={styles.commentUser}>
                              <User size={12} />
                              {c.isAdmin ? 'City Official Response' : 'Community Member'}
                            </span>
                            <span className={styles.commentTime}>
                              {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={styles.commentText}>{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className={styles.commentForm}>
                    <input 
                      type="text" 
                      placeholder={isAdminView ? "Submit official administrator update..." : "Add your comment or concern..."}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className={styles.commentInput}
                      disabled={isSubmittingComment}
                      required
                    />
                    <button 
                      type="submit" 
                      className="btn-neon-cyan" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', height: '100%', borderRadius: '6px' }}
                      disabled={isSubmittingComment}
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </form>
                </div>

                {/* Inside-Modal Admin status controls */}
                {isAdminView && onStatusChange && (
                  <div className={styles.adminControls} style={{ marginTop: '20px' }}>
                    <span className={styles.adminControlLabel}>Change Status:</span>
                    <div className={styles.adminBtnGroup}>
                      <button 
                        onClick={() => onStatusChange(report.id, 'PENDING')} 
                        className={`${styles.adminBtn} ${styles.pendingBtn} ${report.status === 'PENDING' ? styles.activePending : ''}`}
                      >
                        Pending
                      </button>
                      <button 
                        onClick={() => onStatusChange(report.id, 'IN_PROGRESS')} 
                        className={`${styles.adminBtn} ${styles.inProgressBtn} ${report.status === 'IN_PROGRESS' ? styles.activeInProgress : ''}`}
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => onStatusChange(report.id, 'RESOLVED')} 
                        className={`${styles.adminBtn} ${styles.resolvedBtn} ${report.status === 'RESOLVED' ? styles.activeResolved : ''}`}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Navigation & Embedded Google Maps */}
              <div className={styles.modalRightColumn}>
                <div className={styles.mapHeader}>
                  <MapPin size={18} className={styles.mapIcon} />
                  <h4>Live Location Navigation</h4>
                </div>

                <div className={styles.mapFrameContainer}>
                  <iframe
                    title="Google Maps Embed"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: '12px' }}
                    src={
                      report.latitude && report.longitude
                        ? `https://maps.google.com/maps?q=${report.latitude},${report.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                        : `https://maps.google.com/maps?q=${encodeURIComponent(report.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                    }
                    allowFullScreen
                  ></iframe>
                </div>

                <div className={styles.mapFooter}>
                  <p>Drag, zoom, and navigate using the map above to coordinate responses.</p>
                  <a
                    href={
                      report.latitude && report.longitude
                        ? `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.address)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '14px', fontSize: '0.85rem' }}
                  >
                    Open Google Maps In New Tab →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
