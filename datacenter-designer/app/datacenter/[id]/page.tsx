"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

// Define the datacenter details interface
interface DatacenterDetails {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  style_id: string;
  spec?: any;
  modules?: any[];
  placed_modules?: any[];
}

export default function DatacenterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [datacenter, setDatacenter] = useState<DatacenterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSaveDesign = async () => {
    if (!datacenter) return;
    try {
      const response = await fetch(`http://localhost:8000/datacenters/minimal/${datacenter.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });


      if (!response.ok) {
        throw new Error(`Failed to save datacenter: ${response.status}`);
      }

      const responseData = await response.json();
      const dataStr = JSON.stringify(responseData, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportName = `datacenter_design_${datacenter.style_id || 'custom'}_${new Date().toISOString().slice(0, 10)}.json`;

      const a = document.createElement('a');
      a.href = dataUri;
      a.download = exportName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dataUri);
    } catch (err) {
      console.error('Error saving datacenter:', err);
      alert('Failed to save datacenter. Please try again.');
    }
  };

  useEffect(() => {
    const fetchDatacenterDetails = async () => {
      if (!params.id) return;

      try {
        setLoading(true);

        // Use the NextJS API route to avoid CORS issues
        const response = await fetch(`/api/datacenters/${params.id}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch datacenter: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        setDatacenter(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching datacenter details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDatacenterDetails();
  }, [params.id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <main className="flex min-h-screen flex-col p-8 bg-[#011627] text-white">
      <div className="max-w-4xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center text-[#88c0d0] hover:text-[#a3be8c] mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Datacenters
        </Link>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#88c0d0]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-100 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error Loading Datacenter</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md"
            >
              Return to Homepage
            </button>
          </div>
        )}

        {!loading && !error && datacenter && (
          <>
            <div className="bg-[#012456] border border-[#0e3e7b] rounded-lg p-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">{datacenter.name}</h1>
              <p className="text-[#a3be8c] text-lg mb-4">{datacenter.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#011627] p-4 rounded-lg">
                  <h3 className="text-sm text-[#88c0d0] font-semibold">ID</h3>
                  <p className="text-white font-mono break-all">{datacenter.id}</p>
                </div>
                <div className="bg-[#011627] p-4 rounded-lg">
                  <h3 className="text-sm text-[#88c0d0] font-semibold">Style</h3>
                  <p className="text-white">{datacenter.style_id}</p>
                </div>
                <div className="bg-[#011627] p-4 rounded-lg">
                  <h3 className="text-sm text-[#88c0d0] font-semibold">Created</h3>
                  <p className="text-white">{formatDate(datacenter.created_at)}</p>
                </div>
                <div className="bg-[#011627] p-4 rounded-lg">
                  <h3 className="text-sm text-[#88c0d0] font-semibold">Updated</h3>
                  <p className="text-white">{formatDate(datacenter.updated_at)}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white"
                  onClick={() => handleSaveDesign()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <button
                  className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-md"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this datacenter?')) {
                      // Add delete functionality here
                      alert('Delete functionality will be implemented soon');
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Datacenter Specifications */}
            {datacenter.spec && (
              <div className="bg-[#012456] border border-[#0e3e7b] rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(datacenter.spec).map(([key, value]) => (
                    <div key={key} className="bg-[#011627] p-4 rounded-lg">
                      <h3 className="text-sm text-[#88c0d0] font-semibold capitalize">{key.replace('_', ' ')}</h3>
                      <p className="text-white">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placed Modules */}
            {datacenter.placed_modules && datacenter.placed_modules.length > 0 && (
              <div className="bg-[#012456] border border-[#0e3e7b] rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Placed Modules</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#011627] border-b border-[#0e3e7b]">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Position</th>
                        <th className="p-3">Rotation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datacenter.placed_modules.map((module, index) => (
                        <tr key={module.id} className={index % 2 === 0 ? 'bg-[#011627]' : ''}>
                          <td className="p-3 font-mono text-sm">{module.id.substring(0, 8)}...</td>
                          <td className="p-3">{module.module?.type || 'Unknown'}</td>
                          <td className="p-3">{module.module?.name || 'Unnamed'}</td>
                          <td className="p-3">
                            {module.position ? `[${module.position.x}, ${module.position.y}]` : 'N/A'}
                          </td>
                          <td className="p-3">{module.rotation || 0}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
