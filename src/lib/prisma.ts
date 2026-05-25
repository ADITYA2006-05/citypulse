import { PrismaClient } from '@/generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { mockDb, IssueReport, Comment } from './mockDb';

let prisma: PrismaClient | null = null;
const isDbConfigured = !!process.env.DATABASE_URL;

if (isDbConfigured) {
  try {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } catch (error) {
    console.error('Failed to initialize Prisma Client with Pg Adapter:', error);
  }
}

export const db = {
  getReports: async (filters?: { category?: string; status?: string; search?: string }): Promise<IssueReport[]> => {
    if (prisma) {
      try {
        const whereClause: any = {};
        if (filters) {
          if (filters.category && filters.category !== 'ALL') {
            whereClause.category = filters.category;
          }
          if (filters.status && filters.status !== 'ALL') {
            whereClause.status = filters.status;
          }
          if (filters.search) {
            const query = filters.search.toLowerCase();
            whereClause.OR = [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { address: { contains: query, mode: 'insensitive' } }
            ];
          }
        }
        const reports = await prisma.issueReport.findMany({
          where: whereClause,
          orderBy: [
            { upvotes: 'desc' },
            { createdAt: 'desc' }
          ]
        });
        return reports.map(r => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString()
        })) as any;
      } catch (error) {
        console.error('Prisma failed to getReports, falling back to mockDb:', error);
        return mockDb.getReports(filters);
      }
    }
    return mockDb.getReports(filters);
  },

  getReportById: async (id: string): Promise<IssueReport | null> => {
    if (prisma) {
      try {
        const report = await prisma.issueReport.findUnique({
          where: { id },
          include: {
            comments: {
              orderBy: { createdAt: 'asc' }
            }
          }
        });
        if (!report) return null;
        return {
          ...report,
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt.toISOString(),
          comments: report.comments.map(c => ({
            ...c,
            createdAt: c.createdAt.toISOString()
          }))
        } as any;
      } catch (error) {
        console.error('Prisma failed to getReportById, falling back to mockDb:', error);
        return mockDb.getReportById(id);
      }
    }
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
    if (prisma) {
      try {
        const r = await prisma.issueReport.create({
          data: {
            title: data.title,
            description: data.description,
            category: data.category,
            severity: data.severity,
            status: data.status,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            imageUrl: data.imageUrl,
            reporterName: data.reporterName,
            reporterEmail: data.reporterEmail,
            upvotes: 0
          }
        });
        return {
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString()
        } as any;
      } catch (error) {
        console.error('Prisma failed to createReport, falling back to mockDb:', error);
        return mockDb.createReport(data as any);
      }
    }
    return mockDb.createReport(data as any);
  },

  updateReport: async (id: string, data: Partial<IssueReport>): Promise<IssueReport> => {
    if (prisma) {
      try {
        const cleanData = { ...data };
        delete cleanData.id;
        delete cleanData.comments;
        
        const r = await prisma.issueReport.update({
          where: { id },
          data: cleanData as any
        });
        return {
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString()
        } as any;
      } catch (error) {
        console.error('Prisma failed to updateReport, falling back to mockDb:', error);
        return mockDb.updateReport(id, data);
      }
    }
    return mockDb.updateReport(id, data);
  },

  upvoteReport: async (id: string): Promise<IssueReport> => {
    if (prisma) {
      try {
        const r = await prisma.issueReport.update({
          where: { id },
          data: {
            upvotes: { increment: 1 }
          }
        });
        return {
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString()
        } as any;
      } catch (error) {
        console.error('Prisma failed to upvoteReport, falling back to mockDb:', error);
        return mockDb.upvoteReport(id);
      }
    }
    return mockDb.upvoteReport(id);
  },

  createComment: async (issueId: string, content: string, isAdmin: boolean): Promise<Comment> => {
    if (prisma) {
      try {
        const c = await prisma.comment.create({
          data: {
            issueId,
            content,
            isAdmin
          }
        });
        return {
          ...c,
          createdAt: c.createdAt.toISOString()
        } as any;
      } catch (error) {
        console.error('Prisma failed to createComment, falling back to mockDb:', error);
        return mockDb.createComment(issueId, content, isAdmin);
      }
    }
    return mockDb.createComment(issueId, content, isAdmin);
  }
};
export type { IssueReport, Comment };
