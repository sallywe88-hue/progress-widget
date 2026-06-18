import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    percent: 63,
    requiredDone: 6,
    requiredTotal: 10,
    electiveDone: 3,
    electiveTotal: 7,
  });
}
