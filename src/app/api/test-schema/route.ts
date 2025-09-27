import { NextRequest, NextResponse } from 'next/server';
import { habits, therapySessions } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    // Verify schema imports are working by checking table references
    const tableNames = [];
    
    if (habits) {
      tableNames.push('habits');
    }
    
    if (therapySessions) {
      tableNames.push('therapySessions');
    }

    return NextResponse.json({
      message: "Schema test successful",
      tables: tableNames
    }, { status: 200 });

  } catch (error) {
    console.error('Schema test error:', error);
    return NextResponse.json({ 
      error: 'Schema import test failed: ' + error,
      code: 'SCHEMA_IMPORT_ERROR'
    }, { status: 500 });
  }
}