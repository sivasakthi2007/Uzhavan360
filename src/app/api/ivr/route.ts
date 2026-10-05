import { NextRequest, NextResponse } from 'next/server';
import { ooruConnectBackend } from '@/services/ooruConnectService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const digit = parseInt(body.digit || '1');
    const phone = body.phone || '9842100000';

    const result = ooruConnectBackend.processIVRInput(digit, phone);

    return NextResponse.json({
      success: true,
      ivrResult: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
