import { NextRequest, NextResponse } from 'next/server';
import { ooruConnectBackend } from '@/services/ooruConnectService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contact = ooruConnectBackend.resolveRelevantContact({
      userId: body.userId,
      currentScreen: body.currentScreen || 'home',
      currentFeature: body.currentFeature,
      requestId: body.requestId,
      serviceType: body.serviceType,
      location: body.location,
    });

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
