import { NextResponse } from "next/server"
import type { DatacenterStyle } from "@/types/datacenter"

export async function GET() {
  // This would typically come from a database or external file
  const styles: DatacenterStyle[] = 
  [
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
  ]
  

  return NextResponse.json(styles)
}
