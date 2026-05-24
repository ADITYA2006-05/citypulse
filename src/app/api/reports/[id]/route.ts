import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await db.getReportById(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report details:', error);
    return NextResponse.json({ error: 'Failed to fetch report details' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, severity, title, description, address } = body;

    // Check if it is an upvote action
    if (action === 'upvote') {
      const updated = await db.upvoteReport(id);
      return NextResponse.json(updated);
    }

    // Otherwise it is an administrative update
    const updateData: any = {};
    if (status) updateData.status = status;
    if (severity) updateData.severity = severity;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (address) updateData.address = address;

    const updated = await db.updateReport(id, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
