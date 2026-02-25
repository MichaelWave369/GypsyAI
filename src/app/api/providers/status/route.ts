import { NextResponse } from 'next/server';
import { providerStatus } from '@/lib/ai/client';

export async function GET() {
  return NextResponse.json(providerStatus());
}
