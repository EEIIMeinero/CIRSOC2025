import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...project,
    general: JSON.parse(project.general),
    spans: JSON.parse(project.spans),
    supports: JSON.parse(project.supports),
    stiffeners: JSON.parse(project.stiffeners),
    secCfg: JSON.parse(project.secCfg),
    cranes: JSON.parse(project.cranes),
    settings: JSON.parse(project.settings),
    results: project.results ? JSON.parse(project.results) : null,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      engineer: body.engineer,
      license: body.license,
      company: body.company,
      general: body.general ? JSON.stringify(body.general) : undefined,
      spans: body.spans ? JSON.stringify(body.spans) : undefined,
      supports: body.supports ? JSON.stringify(body.supports) : undefined,
      stiffeners: body.stiffeners ? JSON.stringify(body.stiffeners) : undefined,
      secCfg: body.secCfg ? JSON.stringify(body.secCfg) : undefined,
      cranes: body.cranes ? JSON.stringify(body.cranes) : undefined,
      settings: body.settings ? JSON.stringify(body.settings) : undefined,
      results: body.results ? JSON.stringify(body.results) : undefined,
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
