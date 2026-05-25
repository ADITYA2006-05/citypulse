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

export interface Comment {
  id: string;
  issueId: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

// Premium starter seeds (in-memory, no filesystem dependency)
const INITIAL_REPORTS: IssueReport[] = [
  {
    id: 'report-1',
    title: 'Dangerous Pothole on Maple Avenue',
    description: 'A massive, 6-inch deep pothole in the middle lane of Maple Ave, right after the 4th Street intersection. It is forcing vehicles to swerve dangerously into the oncoming lane. Highly hazardous at night.',
    category: 'POTHOLE',
    severity: 'HIGH',
    status: 'PENDING',
    address: '450 Maple Avenue, Downtown',
    latitude: 40.7128,
    longitude: -74.0060,
    imageUrl: null,
    reporterName: 'Sarah Jenkins',
    reporterEmail: 'sarah.j@example.com',
    upvotes: 34,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'report-2',
    title: 'Flickering Street Light SL-847',
    description: 'The street light number SL-847 has been flickering continuously for the last week. It finally went completely dark yesterday, leaving a 50-meter stretch of the pedestrian sidewalk in total darkness.',
    category: 'STREET_LIGHT',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    address: 'Central Park West & 82nd St',
    latitude: 40.7829,
    longitude: -73.9654,
    imageUrl: null,
    reporterName: 'Marcus Vance',
    reporterEmail: 'marcus.v@example.com',
    upvotes: 12,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'report-3',
    title: 'Overflowing Commercial Waste Bins',
    description: 'Several commercial trash bins have not been emptied for over 5 days behind the shopping complex. Overflowing waste is blocking the pedestrian pathway and attracting rodents.',
    category: 'WASTE',
    severity: 'HIGH',
    status: 'PENDING',
    address: '88 Commercial Blvd, Retail District',
    latitude: 40.7589,
    longitude: -73.9851,
    imageUrl: null,
    reporterName: 'David Chen',
    reporterEmail: 'dchen@example.com',
    upvotes: 48,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'report-4',
    title: 'Broken Pedestrian Push-Button at Main St Crosswalk',
    description: 'The pedestrian crossing push-button at the intersection of Main Street and 5th Avenue is completely loose and unresponsive. Walk signal never triggers, making crossing very difficult for elderly citizens.',
    category: 'TRAFFIC_SIGNAL',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    address: 'Main St & 5th Ave',
    latitude: 40.7306,
    longitude: -73.9352,
    imageUrl: null,
    reporterName: 'Elena Rostova',
    reporterEmail: 'elena.r@example.com',
    upvotes: 19,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    issueId: 'report-2',
    content: 'Public works department has assigned a technician to inspect and replace the bulb. Estimated fix date is May 25.',
    isAdmin: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment-2',
    issueId: 'report-4',
    content: 'A repair crew has resolved the wiring issue inside the signal pole and successfully secured the push-button mechanism. The crossing signal is now fully operational.',
    isAdmin: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// In-memory store (no filesystem, compatible with Cloudflare Workers)
let memoryDb: { reports: IssueReport[]; comments: Comment[] } = {
  reports: [...INITIAL_REPORTS],
  comments: [...INITIAL_COMMENTS],
};

export const mockDb = {
  getReports: async (filters?: { category?: string; status?: string; search?: string }): Promise<IssueReport[]> => {
    let filtered = [...memoryDb.reports];

    if (filters) {
      if (filters.category && filters.category !== 'ALL') {
        filtered = filtered.filter(r => r.category === filters.category);
      }
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(r => r.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(query) || 
          r.description.toLowerCase().includes(query) ||
          r.address.toLowerCase().includes(query)
        );
      }
    }

    // Sort by upvotes desc, then newest
    return filtered.sort((a, b) => b.upvotes - a.upvotes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getReportById: async (id: string): Promise<IssueReport | null> => {
    const report = memoryDb.reports.find(r => r.id === id);
    if (!report) return null;

    const reportComments = memoryDb.comments.filter(c => c.issueId === id);
    return {
      ...report,
      comments: reportComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    };
  },

  createReport: async (data: Omit<IssueReport, 'id' | 'upvotes' | 'createdAt' | 'updatedAt'>): Promise<IssueReport> => {
    const newReport: IssueReport = {
      ...data,
      id: 'report-' + Math.random().toString(36).substr(2, 9),
      upvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDb.reports.push(newReport);
    return newReport;
  },

  updateReport: async (id: string, data: Partial<IssueReport>): Promise<IssueReport> => {
    const index = memoryDb.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error(`Report not found with id: ${id}`);

    const updated = {
      ...memoryDb.reports[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    memoryDb.reports[index] = updated;
    return updated;
  },

  upvoteReport: async (id: string): Promise<IssueReport> => {
    const index = memoryDb.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error(`Report not found with id: ${id}`);

    memoryDb.reports[index].upvotes += 1;
    return memoryDb.reports[index];
  },

  createComment: async (issueId: string, content: string, isAdmin: boolean): Promise<Comment> => {
    const newComment: Comment = {
      id: 'comment-' + Math.random().toString(36).substr(2, 9),
      issueId,
      content,
      isAdmin,
      createdAt: new Date().toISOString()
    };
    memoryDb.comments.push(newComment);
    return newComment;
  }
};
