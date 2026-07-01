import { NextResponse } from 'next/server';
import type { Session } from '@/lib/types';

export async function GET() {
  return NextResponse.json({
    message: 'Cloud session sync is not implemented yet. Sessions are stored locally in the browser.',
    sessions: [] as Session[],
  });
}

export async function POST() {
  return NextResponse.json(
    { message: 'Cloud session sync is not implemented yet.' },
    { status: 501 },
  );
}
