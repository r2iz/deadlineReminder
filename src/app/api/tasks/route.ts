import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const tasks = await prisma.task.findMany({
        include: {
            assignees: true,
        },
    });
    const formattedTasks = tasks.map((task) => ({
        ...task,
        assignees: task.assignees.map((assignee) => assignee.id),
    }));
    return NextResponse.json(formattedTasks);
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    body.assignees = { connect: body.assignees.map((id: string) => ({ id })) };
    const task = await prisma.task.create({
        data: {
            title: body.title,
            assignees: body.assignees,
            deadline: new Date(body.deadline),
        },
    });
    return NextResponse.json(task);
}
