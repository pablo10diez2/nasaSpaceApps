"use client";

import { useState, useEffect } from "react";
import DatacenterDesigner from '@/components/datacenter-designer';
import type { DatacenterStyle } from '@/types/datacenter';
import { notFound } from 'next/navigation';
import React from "react";

async function getDatacenterStyles(): Promise<DatacenterStyle[]> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/datacenter-styles`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch datacenter styles');
    return res.json();
}

async function generate_custom(prompt: string) {
    const res = await fetch('/api/generate-custom-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to generate style');
    const style = await res.json();
    console.log("Generated style:", style);
    return style;
}

export default function DesignerPage({ params }: { params: { styleId: string } }) {
    // const { styleId } = params || "";
    const { styleId } = React.use(params);
    const [customPrompt, setCustomPrompt] = useState('');
    const [showPrompt, setShowPrompt] = useState(styleId === "custom");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<DatacenterStyle | null>(null);

    console.log("STYLE JSON:", selectedStyle);  

    // Handle custom prompt submission
    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const style = await generate_custom(customPrompt);
            setSelectedStyle(style);
            setShowPrompt(false);
        } catch (err: any) {
            setError(err.message || "Failed to generate custom style");
        } finally {
            setLoading(false);
        }
    };

    // Fetch style if not custom
    useEffect(() => {
        if (styleId !== "custom") {
            setLoading(true);
            setError(null);
            getDatacenterStyles()
                .then(styles => {
                    const found = styles.find(style => style.id === decodeURIComponent(styleId));
                    if (!found) {
                        setError("Style not found");
                    } else {
                        setSelectedStyle(found);
                    }
                })
                .catch(err => setError(err.message || "Failed to load style data"))
                .finally(() => setLoading(false));
        }
    }, [styleId]);

    if (error) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#011627] text-white">
                <h1 className="text-red-500">Error loading designer</h1>
                <p>{error}</p>
            </main>
        );
    }

    if (showPrompt) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#011627] text-white">
                <form
                    onSubmit={handleCustomSubmit}
                    className="bg-[#012456] p-8 rounded-2xl shadow-2xl flex flex-col gap-6 min-w-[340px] max-w-[95vw] border border-[#3a7ca5] relative"
                    style={{
                        boxShadow: "0 8px 32px 0 rgba(58,124,165,0.25), 0 1.5px 0 0 #3a7ca5 inset"
                    }}
                >
                    <h2 className="text-2xl font-extrabold mb-2 text-[#3a7ca5] tracking-wide flex items-center gap-2">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#011627"/><rect x="4" y="4" width="16" height="16" rx="3" fill="#012456" stroke="#3a7ca5" strokeWidth="2"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#011627" stroke="#3a7ca5" strokeWidth="1.5"/></svg>
                        Custom Datacenter Blueprint
                    </h2>
                    <label className="text-[#7ecfff] font-semibold text-sm mb-1" htmlFor="customPrompt">
                        Describe your datacenter requirements
                    </label>
                    <textarea
                        id="customPrompt"
                        className="p-3 rounded-lg bg-[#011627] border-2 border-[#3a7ca5] text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#3a7ca5] transition-all"
                        rows={5}
                        value={customPrompt}
                        onChange={e => setCustomPrompt(e.target.value)}
                        required
                        placeholder="e.g. 1000 servers, high redundancy, water cooling, 10Gbps network, 500TB storage..."
                        disabled={loading}
                        style={{ fontFamily: "inherit", fontSize: "1rem" }}
                    />
                    {error && <div className="text-red-400 font-semibold">{error}</div>}
                    <div className="flex gap-3 justify-end mt-2">
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#3a7ca5] to-[#1a5aab] hover:from-[#1a5aab] hover:to-[#3a7ca5] font-bold shadow-md transition-all"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </main>
        );
    }

    if (!selectedStyle) {
        return null; // or loading spinner
    }

    return (
        <main className="flex min-h-screen flex-col">
            <DatacenterDesigner
                styleId={selectedStyle.id}
                styleData={selectedStyle}
            />
        </main>
    );
}