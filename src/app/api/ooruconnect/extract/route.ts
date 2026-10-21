import { NextRequest, NextResponse } from 'next/server';
import { extractHelpRequest } from '@/services/ooruConnectEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;
    const userLocation = body.userLocation;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text request is required' },
        { status: 400 }
      );
    }

    const parsedRequest = await extractHelpRequest(text.trim(), userLocation);

    return NextResponse.json({
      success: true,
      data: parsedRequest
    });
  } catch (error: any) {
    console.error('[API /api/ooruconnect/extract] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to extract help request' },
      { status: 500 }
    );
  }
}
