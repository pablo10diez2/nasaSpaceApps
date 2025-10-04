import { NextRequest, NextResponse } from "next/server";
import type { DatacenterStyle } from "@/types/datacenter";
import { GoogleGenAI } from "@google/genai";

// You need to set this in your .env.local file:
// GEMINI_API_KEY=your_google_gemini_api_key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

// Helper: fetch current styles (from your API or DB)
async function getCurrentStyles(): Promise<DatacenterStyle[]> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/datacenter-styles`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch datacenter styles");
    return res.json();
}

// Helper: call Gemini API using @google/genai
async function callGemini(prompt: string, styles: DatacenterStyle[]): Promise<DatacenterStyle> {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });

    const systemPrompt = `
You are an AI assistant that generates datacenter style objects for a datacenter designer app.
Given the following user prompt and the existing styles (see below), generate a new style object in JSON that fits the following TypeScript interface:

interface DatacenterStyle {
  id: string
  name: string
  description: string
  grid_connection: number
  water_connection: number
  processing: number | null
  price: number | null
  dim: [number, number]
  data_storage: number | null
  focus: "processing" | "storage" | "network" | "server"
  recommended_modules?: string[]
}

The JSON must be valid, with a unique id (use a random string), and all required fields. Do not include any explanation, just the JSON object.

User prompt: """${prompt}"""

If the user prompt is not clear, STILL OUTPUT A VALID JSON 

Here are the existing styles:

   {
      "id": "server_square",
      "name": "Server Squares",
      "description": "Balanand ced mid-tier data center with decent processing and storage capabilities.",
      "grid_connection": 3,
      "water_connection": 1,
      "dim": [1000, 500],
      "data_storage": 1000,
      "processing": 1000,
      "price": 1000000,
      "focus": "server"
    },
    {
      "id": "dense_storage",
      "name": "Dense Storage",
      "description": "Optimized for maximum data storage with minimal space usage.",
      "grid_connection": -1,
      "water_connection": -1,
      "dim": [1000, 1000],
      "data_storage": -1,
      "processing": null,
      "price": 5000000,
      "focus": "storage"
    },
    {
      "id": "supercomputer",
      "name": "Supercomputer",
      "description": "High-performance compute-heavy unit with advanced processing capabilities.",
      "grid_connection": -1,
      "water_connection": -1,
      "dim": [2000, 1000],
      "data_storage": null,
      "processing": -1,
      "price": null,
      "focus": "processing"
    }

Existing styles:
${JSON.stringify(styles, null, 2)}
`;

    const model = "gemini-2.0-flash";
    const result = await ai.models.generateContent({ model: model, contents: systemPrompt });
    const text = result.text || "";

    // Try to extract JSON from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in Gemini response");
    const style = JSON.parse(match[0]);
    return style;
}

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();
        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
        }

        const styles = await getCurrentStyles();
        const customStyle = await callGemini(prompt, styles);

        // Optionally: validate the object here
        console.log("Generated style:", customStyle);

        return NextResponse.json(customStyle);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to generate style" }, { status: 500 });
    }
}