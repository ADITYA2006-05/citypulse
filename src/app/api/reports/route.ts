import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const reports = await db.getReports({ category, status, search });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      severity,
      address,
      latitude,
      longitude,
      imageUrl,
      reporterName,
      reporterEmail
    } = body;

    // Validation
    if (!title || !description || !category || !severity || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, severity, address are required.' },
        { status: 400 }
      );
    }

    const report = await db.createReport({
      title,
      description,
      category,
      severity,
      status: 'PENDING', // Default to PENDING for new reports
      address,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      imageUrl: imageUrl || undefined,
      reporterName: reporterName || undefined,
      reporterEmail: reporterEmail || undefined
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
