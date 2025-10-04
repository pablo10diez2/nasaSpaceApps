"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DatacenterStyle } from '@/types/datacenter';
import styles from '@/components/datacenter-designer.module.css';

// Define the datacenter interface based on the API response
interface Datacenter {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  style_id: string;
}

export default function SelectStylePage() {
  const [stylesList, setStylesList] = useState<DatacenterStyle[]>([]);
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch datacenter styles
        const stylesResponse = await fetch('/api/datacenter-styles');
        if (!stylesResponse.ok) {
          throw new Error(`Failed to fetch styles: ${stylesResponse.statusText}`);
        }
        const stylesData: DatacenterStyle[] = await stylesResponse.json();
        setStylesList(stylesData);

        // Fetch datacenters
        try {
          const datacentersResponse = await fetch('http://localhost:8000/datacenters');
          if (!datacentersResponse.ok) {
            const errorText = await datacentersResponse.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch datacenters: ${datacentersResponse.status} ${datacentersResponse.statusText}`);
          }
          const datacentersData = await datacentersResponse.json();
          setDatacenters(datacentersData.datacenters);
        } catch (err) {
          console.error('Fetch error details:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0 bg-gradient-to-br from-[#011627] via-[#012456] to-[#0e3e7b] text-white relative overflow-x-hidden">
      {/* Decorative Blueprint Grid Overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(58,124,165,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(58,124,165,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="mb-10 text-center z-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-[#a3be8c] drop-shadow-lg mb-2">
          <span className="inline-block animate-pulse">✨ Rack Attack ✨</span>
        </h1>
        <p className="text-lg text-[#7ecfff] font-medium tracking-wide">
          Design, visualize, and manage your datacenters with AI-powered blueprints.
        </p>
      </div>

      <section className="w-full max-w-6xl z-10">
        {/* Datacenter Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-[#3a7ca5] flex items-center gap-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#011627"/><rect x="4" y="4" width="16" height="16" rx="3" fill="#012456" stroke="#3a7ca5" strokeWidth="2"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#011627" stroke="#3a7ca5" strokeWidth="1.5"/></svg>
            Your Datacenters
          </h2>
          {loading && <p className="text-[#7ecfff]">Loading data...</p>}
          {error && <p className="text-red-400 font-semibold">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto pb-4 flex space-x-6 scrollbar-thin scrollbar-thumb-[#3a7ca5]/40 scrollbar-track-transparent">
              {datacenters.length > 0 ? (
                datacenters.map((datacenter) => (
                  <Link
                    key={datacenter.id}
                    href={`/datacenter/${encodeURIComponent(datacenter.id)}`}
                    className="flex-shrink-0 w-72 p-6 rounded-2xl border border-[#3a7ca5] bg-gradient-to-br from-[#012456] to-[#011627] hover:from-[#0a2d5e] hover:to-[#012456] transition-all shadow-lg group"
                  >
                    <h3 className="text-xl font-bold text-white truncate mb-1 group-hover:text-[#a3be8c] transition-colors">{datacenter.name}</h3>
                    <p className="text-sm text-[#a3be8c] mb-3 h-14 overflow-hidden">{datacenter.description}</p>
                    <div className="flex justify-between text-xs text-[#7ecfff]">
                      <span>Created: {formatDate(datacenter.created_at)}</span>
                      <span>Style: {datacenter.style_id}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full text-center py-6">
                  <p>No datacenters found. Create one to get started!</p>
                  <button
                    className="mt-2 px-5 py-2 bg-gradient-to-r from-[#3a7ca5] to-[#1a5aab] hover:from-[#1a5aab] hover:to-[#3a7ca5] rounded-lg font-semibold shadow"
                    onClick={() => router.push("/designer/custom")}
                  >
                    Create New Datacenter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Datacenter Style Grid */}
        <h2 className="text-2xl font-bold mb-4 text-[#3a7ca5] flex items-center gap-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#011627"/><rect x="4" y="4" width="16" height="16" rx="3" fill="#012456" stroke="#3a7ca5" strokeWidth="2"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#011627" stroke="#3a7ca5" strokeWidth="1.5"/></svg>
          Create New Datacenter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Custom Card */}
          <button
            className="block p-8 rounded-2xl border-2 border-dashed border-[#3a7ca5] bg-gradient-to-br from-[#011845] to-[#012456] hover:from-[#0a2d5e] hover:to-[#011845] transition-all text-left w-full h-full shadow-lg"
            onClick={() => router.push("/designer/custom")}
            type="button"
          >
            <h2 className="text-xl font-bold mb-2 text-[#3a7ca5] flex items-center gap-2">
              <span className="inline-block">Custom</span>
              <span className="ml-1 text-[#7ecfff] text-base font-normal">AI Blueprint</span>
            </h2>
            <p className="text-sm text-[#a3be8c]">Describe your ideal datacenter and generate a custom style using AI.</p>
          </button>
          {/* Standard Styles */}
          {stylesList.length > 0 ? (
            stylesList.map((style) => (
              <Link
                key={style.id}
                href={`/designer/${encodeURIComponent(style.id)}`}
                className="block p-8 rounded-2xl border border-[#3a7ca5] bg-gradient-to-br from-[#012456] to-[#011627] hover:from-[#0a2d5e] hover:to-[#012456] transition-all shadow-lg"
              >
                <h2 className="text-xl font-bold mb-2 text-white">{style.name}</h2>
                {style.dim[0] !== -1 && (
                  <p className="text-sm text-[#7ecfff] mb-1">
                    Grid Size: {style.dim[0]}m x {style.dim[1]}m
                  </p>
                )}
                <p className="text-sm text-[#a3be8c]">{style.description}</p>
              </Link>
            ))
          ) : (
            <p className="col-span-3 text-center text-[#7ecfff]">No datacenter styles found.</p>
          )}
        </div>
      </section>

      {/* Decorative corner SVGs */}
      <svg className="absolute left-0 top-0 w-40 h-40 opacity-20 pointer-events-none" viewBox="0 0 100 100">
        <rect x="0" y="0" width="100" height="100" rx="20" fill="#3a7ca5" />
      </svg>
      <svg className="absolute right-0 bottom-0 w-40 h-40 opacity-20 pointer-events-none" viewBox="0 0 100 100">
        <rect x="0" y="0" width="100" height="100" rx="20" fill="#a3be8c" />
      </svg>
    </main>
  );
}
