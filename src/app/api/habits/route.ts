import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    error: "This endpoint is deprecated. Please use /api/habits-v2 instead.",
    code: "DEPRECATED_ENDPOINT"
  }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({
    error: "This endpoint is deprecated. Please use /api/habits-v2 instead.",
    code: "DEPRECATED_ENDPOINT"
  }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({
    error: "This endpoint is deprecated. Please use /api/habits-v2 instead.",
    code: "DEPRECATED_ENDPOINT"
  }, { status: 410 });
}

export async function PATCH() {
  return NextResponse.json({
    error: "This endpoint is deprecated. Please use /api/habits-v2 instead.",
    code: "DEPRECATED_ENDPOINT"
  }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({
    error: "This endpoint is deprecated. Please use /api/habits-v2 instead.",
    code: "DEPRECATED_ENDPOINT"
  }, { status: 410 });
}