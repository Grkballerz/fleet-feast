import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      userCount,
      message: "Database connection successful"
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json({
      status: "error",
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
