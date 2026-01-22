import { NextResponse } from 'next/server';
import { getRecords } from '@/lib/records';

export async function GET() {
    try {
        const records = getRecords();
        return NextResponse.json({ success: true, records });
    } catch (error) {
        console.error('[API] Failed to read records:', error);
        return NextResponse.json({ success: false, error: '读取记录失败' }, { status: 500 });
    }
}
