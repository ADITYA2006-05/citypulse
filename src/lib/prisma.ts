import { mockDb, IssueReport, Comment } from './mockDb';

// Unified Database API using our robust mockDb persistent layer.
// This decouples the application build from local database installation issues,
// ensuring the site is immediately operational and testable.
export const db = {
  getReports: async (filters?: { category?: string; status?: string; search?: string }): Promise<IssueReport[]> => {
    return mockDb.getReports(filters);
  },

  getReportById: async (id: string): Promise<IssueReport | null> => {
    return mockDb.getReportById(id);
  },

  createReport: async (data: {
    title: string;
    description: string;
    category: string;
    severity: string;
    status: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    imageUrl?: string | null;
    reporterName?: string | null;
    reporterEmail?: string | null;
  }): Promise<IssueReport> => {
    return mockDb.createReport(data as any);
  },

  updateReport: async (id: string, data: Partial<IssueReport>): Promise<IssueReport> => {
    return mockDb.updateReport(id, data);
  },

  upvoteReport: async (id: string): Promise<IssueReport> => {
    return mockDb.upvoteReport(id);
  },

  createComment: async (issueId: string, content: string, isAdmin: boolean): Promise<Comment> => {
    return mockDb.createComment(issueId, content, isAdmin);
  }
};
export type { IssueReport, Comment };
