import { NextRequest, NextResponse } from "next/server";
import type { DatacenterStyle, Module } from "@/types/datacenter";
import { GoogleGenAI } from "@google/genai";

// You need to set this in your .env.local file:
// GEMINI_API_KEY=your_google_gemini_api_key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

// Helper: fetch modules
async function getModules(): Promise<Module[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/modules`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch modules");
  return res.json();
}

// Helper: call Gemini API to generate a design
async function callGemini(style: DatacenterStyle, modules: Module[]): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });

  const systemPrompt = `
You are an AI assistant that generates datacenter layouts.
Given the following datacenter style and available modules, generate a JSON object with this format:

{
  "styleId": "<style id>",
  "modules": [
    {
      "id": "<module id>",
      "position": { "x": <number>, "y": <number> },
      "rotation": <number>
    }
  ]
}

The modules array should be a valid layout for the style. Use only module IDs from the provided list. Do not include any explanation, just the JSON object.

Datacenter style:
${JSON.stringify(style, null, 2)}

Available modules:
${JSON.stringify(modules, null, 2)}
`;

  const model = "gemini-2.0-flash";
  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();

  // Try to extract JSON from the response
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in Gemini response");
  const design = JSON.parse(match[0]);
  return design;
}

export async function POST(req: NextRequest) {
  try {
    const { styleId, styleData } = await req.json();
    const modules = await getModules();
    const design = await callGemini(styleData, modules);
    return NextResponse.json(design);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to auto-generate design" }, { status: 500 });
  }
}