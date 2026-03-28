import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      engineer: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const project = await prisma.project.create({
    data: {
      name: body.name || "Nuevo Proyecto",
      description: body.description || null,
      engineer: body.engineer || null,
      license: body.license || null,
      company: body.company || null,
      general: JSON.stringify(body.general || {}),
      spans: JSON.stringify(body.spans || []),
      supports: JSON.stringify(body.supports || []),
      stiffeners: JSON.stringify(body.stiffeners || []),
      secCfg: JSON.stringify(body.secCfg || {}),
      cranes: JSON.stringify(body.cranes || []),
      settings: JSON.stringify(body.settings || {}),
    },
  });
  return NextResponse.json(project, { status: 201 });
}
