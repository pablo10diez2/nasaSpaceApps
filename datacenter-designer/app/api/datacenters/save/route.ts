import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestData = await request.json();

    // Extract required data
    const { styleId, modules } = requestData;

    // Optional fields with defaults
    const name = requestData.name || `Datacenter design ${new Date().toISOString().slice(0, 10)}`;
    const description = requestData.description || `Created with Datacenter Designer`;

    // Prepare the payload for the backend API
    const payload = {
      styleId,
      modules,
      name,
      description
    };

    // Send request to backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/datacenters/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle API response
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Backend API responded with status: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    // Return the successful response data
    const data = await response.json();
    return NextResponse.json({
      id: data.datacenter?.id,
      message: 'Datacenter saved successfully',
      datacenter: data.datacenter
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving datacenter:', error);
    return NextResponse.json(
      { error: 'Failed to save datacenter', details: String(error) },
      { status: 500 }
    );
  }
}
