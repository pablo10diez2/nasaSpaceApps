export interface Module {
  id: string
  object_id?: string  // Added object_id as optional property
  type?: string
  dim: [number, number] // [width, height] in meters
  price: number | null
  description?: string

  // Water related
  supplied_water?: number // kL
  water_usage?: number // kL
  chilled_water?: number // kL
  distilled_water?: number // kL
  fresh_water?: number // kL

  // Power
  usable_power?: number

  // Compute related
  processing?: number // TFLOPS
  storage_capacity?: number // TB
  network_capacity?: number // Gbps
  internal_network?: number // the amount going out
  external_network?: number
  data_storage?: number


  // Grid & utility connection
  grid_connection?: number
  water_connection?: number
}

export interface PlacedModule {
  id: string
 module: Module
  position: {
    x: number
    y: number
  }
  rotation: number // 0, 90, 180, 270 degrees
}


export interface DatacenterStyle {
  id: string
  name: string
  description: string // a quick description
  grid_connection: number // how much grid connections it has
  water_connection: number  // how much water it has
  processing: number | null // processing power of the server
  price: number | null // the price of the server, if null we want to minimize
  dim: [number, number]
  data_storage: number | null
  focus: "processing" | "storage" | "network" | "server"
  recommended_modules?: string[] // Array of module names
}
