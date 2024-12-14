import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const task = await prisma.task.update({
    where: { id: params.id },
    data: { completed: true },
  })
  return NextResponse.json(task)
}

