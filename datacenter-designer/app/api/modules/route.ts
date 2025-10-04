import { NextResponse } from "next/server"
import type { Module } from "@/types/datacenter"

export async function GET() {
  // This would typically come from a database or external file
  const modules: Module[] = [
      {
        "id": "transformer_100",
        "type": "transformer",
        "grid_connection": 1,
        "dim": [40, 40],
        "price": 1000,
        "usable_power": 100
      },
      {
        "id": "transformer_1000",
        "type": "transformer",
        "grid_connection": 1,
        "dim": [100, 100],
        "price": 50000,
        "usable_power": 1000
      },
      {
        "id": "transformer_5000",
        "type": "transformer",
        "grid_connection": 1,
        "dim": [200, 200],
        "price": 250000,
        "usable_power": 5000
      },
      {
        "id": "water_supply_100",
        "type": "water supply",
        "water_connection": 1,
        "dim": [50, 50],
        "price": 200,
        "fresh_water": 100
      },
      {
        "id": "water_supply_500",
        "type": "water supply",
        "water_connection": 1,
        "dim": [150, 100],
        "price": 400,
        "fresh_water": 500
      },
      {
        "id": "water_treatment_50",
        "type": "water treatment",
        "fresh_water": 50,
        "usable_power": -50,
        "dim": [50, 50],
        "price": 10000,
        "distilled_water": 50
      },
      {
        "id": "water_treatment_250",
        "type": "water treatment",
        "fresh_water": 250,
        "usable_power": -90,
        "dim": [200, 200],
        "price": 40000,
        "distilled_water": 250
      },
      {
        "id": "water_treatment_500",
        "type": "water treatment",
        "fresh_water": 500,
        "usable_power": -150,
        "dim": [400, 400],
        "price": 70000,
        "distilled_water": 500
      },
      {
        "id": "water_chiller_100",
        "type": "water chiller",
        "distilled_water": 100,
        "usable_power": -500,
        "dim": [100, 100],
        "price": 40000,
        "chilled_water": 95
      },
      {
        "id": "water_chiller_400",
        "type": "water chiller",
        "distilled_water": 400,
        "usable_power": -1500,
        "dim": [300, 100],
        "price": 150000,
        "chilled_water": 390
      },
      {
        "id": "network_rack_50",
        "type": "network rack",
        "usable_power": -50,
        "chilled_water": -5,
        "internal_network": 50,
        "fresh_water": -5,
        "dim": [40, 40],
        "price": 2000
      },
      {
        "id": "network_rack_100",
        "type": "network rack",
        "usable_power": -75,
        "chilled_water": -7,
        "internal_network": 100,
        "fresh_water": -7,
        "dim": [40, 40],
        "price": 8000
      },
      {
        "id": "network_rack_200",
        "type": "network rack",
        "usable_power": -95,
        "chilled_water": -10,
        "internal_network": 200,
        "fresh_water": -40,
        "dim": [40, 40],
        "price": 20000
      },
      {
        "id": "server_rack_100",
        "type": "server rack",
        "usable_power": -75,
        "chilled_water": -15,
        "internal_network": -10,
        "distilled_water": 15,
        "processing": 100,
        "external_network": 100,
        "dim": [40, 40],
        "price": 8000
      },
      {
        "id": "server_rack_200",
        "type": "server rack",
        "usable_power": -125,
        "chilled_water": -25,
        "internal_network": -18,
        "distilled_water": -25,
        "processing": 150,
        "external_network": 200,
        "dim": [40, 40],
        "price": 12000
      },
      {
        "id": "server_rack_500",
        "type": "server rack",
        "usable_power": -240,
        "chilled_water": -50,
        "internal_network": -32,
        "distilled_water": -50,
        "processing": 1000,
        "external_network": 400,
        "dim": [40, 40],
        "price": 50000
      },
      {
        "id": "data_rack_100",
        "type": "data rack",
        "usable_power": -15,
        "chilled_water": -3,
        "internal_network": -5,
        "distilled_water": -3,
        "data_storage": 100,
        "dim": [40, 40],
        "price": 2000
      },
      {
        "id": "data_rack_250",
        "type": "data rack",
        "usable_power": -25,
        "chilled_water": -3,
        "internal_network": -10,
        "distilled_water": -3,
        "data_storage": 250,
        "dim": [40, 40],
        "price": 7500
      },
      {
        "id": "data_rack_500",
        "type": "data rack",
        "usable_power": -40,
        "chilled_water": -6,
        "internal_network": -20,
        "distilled_water": -6,
        "data_storage": 500,
        "dim": [40, 40],
        "price": 20500
      }    
  ]

  return NextResponse.json(modules)
}