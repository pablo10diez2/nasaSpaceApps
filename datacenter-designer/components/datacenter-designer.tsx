"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import ModuleLibrary from "./module-library"
import DesignerControls from "./designer-controls"
import DatacenterGrid from "./datacenter-grid"
import ModuleDetails from "./module-details"
import type { DatacenterStyle, Module, PlacedModule } from "@/types/datacenter"
import styles from "./datacenter-designer.module.css"
import { set } from "date-fns"

interface DatacenterDesignerProps {
  styleId: string
  // Now allow the passing of the entire json style object
  styleData: DatacenterStyle
}
export default function DatacenterDesigner({ styleId, styleData }: DatacenterDesignerProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [datacenterStyles, setDatacenterStyles] = useState<DatacenterStyle[]>([])
  const [selectedStyle, setSelectedStyle] = useState<DatacenterStyle | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([])
  const [gridSize, setGridSize] = useState({ width: styleData.dim[0] / 10, height: styleData.dim[1] / 10 })

  const [totalCost, setTotalCost] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [totalWater, setTotalWater] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalProcessing, setTotalProcessing] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [totalInternalWater, setTotalInternalWater] = useState(0);
  const [totalInternalNetwork, setTotalInternalNetwork] = useState(0);
  const [totalExternalNetwork, setTotalExternalNetwork] = useState(0);

  let goalArea = 0; // Total area of the datacenter
  let goalWater = 0;
  let goalProcessing = 0;
  let goalNetwork = 0;
  let goalStorage = 0;
  let targetPrice = 0;

  // Our goals are dependent on the style 
  targetPrice = styleData.price ?? 0
  console.log("STYLE ID:", styleId);
  console.log("STYLE DATA:", styleData); 

  if (styleId === "server_square") {
    goalArea = 1000 * 500;
    goalStorage = styleData.data_storage ?? 0
    console.log("STORAGE:", goalStorage);
    goalProcessing = styleData.processing ?? 0 
    


  } else if (styleId === "dense_storage") {
    // Maximize storage 


  } else if (styleId === "supercomputer") {
    // Maximize processing 
    goalArea = 2000 * 1000;
  } else {
    console.log("CUSTOM!");
    console.log("storage: ", styleData.data_storage);
    // Custom 
    if (styleData.data_storage || 0 > 0) {
      goalStorage = styleData.data_storage ?? 0
    }
    if (styleData.processing || 0 > 0) {
      goalProcessing = styleData.processing ?? 0
    }
    if (styleData.water_connection || 0 > 0) {
      goalWater = styleData.water_connection ?? 0
    }
    if (styleData.grid_connection || 0 > 0) {
      goalNetwork = styleData.grid_connection ?? 0
    }
    if (styleData.water_connection || 0 > 0) {
      goalWater = styleData.water_connection ?? 0
    }

  }

  // Print all goals 
  console.log("GOALS: ", goalArea, goalWater, goalProcessing, goalNetwork, goalStorage);

  const [isPlacingModule, setIsPlacingModule] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  // Orbit controls ref 
  const orbitControlsRef = useRef<any>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  // State to store the maximum sidebar width
  const [maxSidebarWidth, setMaxSidebarWidth] = useState(300); // Default value

  // Update the maximum sidebar width when the window size changes
  useEffect(() => {
    // Only access window after the component has been mounted
    const updateMaxWidth = () => {
      setMaxSidebarWidth(window.innerWidth * 0.3);
    };

    // Set the initial value
    updateMaxWidth();

    // Add event listener to update when window size changes
    window.addEventListener('resize', updateMaxWidth);

    // Cleanup when unmounting
    return () => window.removeEventListener('resize', updateMaxWidth);
  }, []);

  // Modify the handleMouseMove function to use the maxSidebarWidth state
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const newWidth = e.clientX;
    // Use the maxSidebarWidth state instead of calculating window.innerWidth * 0.3 directly
    if (newWidth >= 300 && newWidth <= maxSidebarWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const stopResizing = () => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  // Load module and datacenter style definitions
  useEffect(() => {
    const loadData = async () => {
      try {
        const modulesResponse = await fetch("/api/modules")
        const stylesResponse = await fetch("/api/datacenter-styles")

        const modulesData = await modulesResponse.json()
        const stylesData = await stylesResponse.json()

        setModules(modulesData)
        setDatacenterStyles(stylesData)

        // Find and set the selected style based on the styleId passed as prop
        const currentStyle = stylesData.find((style: DatacenterStyle) => style.id === styleId)
        if (currentStyle) {
          setSelectedStyle(currentStyle)
        } else if (stylesData.length > 0) {
          // Fallback in case the style is not found
          setSelectedStyle(stylesData[0])
        }

        // Check if there is a pending design in localStorage
        const pendingDesignData = localStorage.getItem('pendingDesignData');
        if (pendingDesignData) {
          // Remove from localStorage to avoid duplicate loads
          localStorage.removeItem('pendingDesignData');

          // Wait a moment to ensure that modules and styles have been loaded
          setTimeout(() => {
            handleLoadDesign(JSON.parse(pendingDesignData));
          }, 500);
        }
      } catch (error) {
        console.error("Failed to load datacenter data:", error)
      }
    }

    loadData()
  }, [styleId]) // Added styleId as a dependency to update if it changes

  // Calculate totals when placed modules change
  useEffect(() => {
    let cost = 0
    let power = 0
    let water = 0
    let internalWater = 0
    let internalNetwork = 0
    let network = 0
    let processing = 0
    let storage = 0
    let area = 0


    placedModules.forEach((placed) => {
      cost += placed.module.price || 0
      power += placed.module.usable_power || 0
      water += placed.module.fresh_water || 0
      internalWater += placed.module.distilled_water || 0
      network += placed.module.external_network || 0
      internalNetwork += placed.module.internal_network || 0
      processing += placed.module.processing || 0
      storage += placed.module.data_storage || 0
      area += (placed.module.dim[0]) * (placed.module.dim[1]) // Area in m^2
      console.log("NETWORK:", placed.module.external_network, placed.module.internal_network);
    })

    setTotalCost(cost)

    // Print all possible values
    console.log("POWER: ", power, " WATER: ", water, " INTERNAL WATER: ", internalWater, " NETWORK: ", network, " INTERNAL NETWORK: ", internalNetwork, " PROCESSING: ", processing, " STORAGE: ", storage, " AREA: ", area);

    setTotalPower(power)
    setTotalProcessing(processing)
    setTotalStorage(storage)
    setTotalExternalNetwork(network)
    setTotalInternalNetwork(internalNetwork)
    setTotalInternalWater(internalWater)
    setTotalWater(water)

  }, [placedModules])

  // Add listener for the custom event
  useEffect(() => {
    const handleClearAllModules = () => {
      // Clear all placed modules
      setPlacedModules([]);
      // Optionally, also update the metric calculations
      setTotalCost(0);
      setTotalPower(0);
      setTotalWater(0);
      setTotalArea(0);
    };

    // Register the listener
    window.addEventListener('clearAllModules', handleClearAllModules);

    // Clean up on unmount
    return () => {
      window.removeEventListener('clearAllModules', handleClearAllModules);
    };
  }, []);

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module)
    setIsPlacingModule(true)
  }

  const handleModulePlacement = (x: number, y: number, rotation = 0) => {
    if (!selectedModule) return

    // Check if placement is valid (not overlapping other modules)
    const isValid = checkPlacementValidity(x, y, selectedModule, rotation)
    console.log("Placing!");
    if (isValid) {
      console.log("Placing");
      const newPlacedModule: PlacedModule = {
        id: `${Date.now()}`,
        module: selectedModule,
        position: { x, y },
        rotation,
      }

      setPlacedModules([...placedModules, newPlacedModule])
      setIsPlacingModule(false)
    }
  }

  const checkPlacementValidity = (x: number, y: number, module: Module, rotation: number): boolean => {
    if (!module) return false

    // Get module dimensions, accounting for rotation, scaled down by 10x
    const moduleWidth = rotation % 180 === 0 ? module.dim[0] / 10 : module.dim[1] / 10
    const moduleHeight = rotation % 180 === 0 ? module.dim[1] / 10 : module.dim[0] / 10

    // Check if module is within grid bounds
    if (x < 0 || y < 0 || x + moduleWidth > gridSize.width || y + moduleHeight > gridSize.height) {
      return false
    }

    // Check for overlaps with existing modules
    for (const placed of placedModules) {
      const placedWidth = placed.rotation % 180 === 0 ? placed.module.dim[0] / 10 : placed.module.dim[1] / 10
      const placedHeight = placed.rotation % 180 === 0 ? placed.module.dim[1] / 10 : placed.module.dim[0] / 10

      // Check for overlap
      if (
        x < placed.position.x + placedWidth &&
        x + moduleWidth > placed.position.x &&
        y < placed.position.y + placedHeight &&
        y + moduleHeight > placed.position.y
      ) {
        return false
      }
    }

    return true
  }


  const handleRemoveModule = (id: string) => {
    setPlacedModules(placedModules.filter((module) => module.id !== id))
  }

  const handleStyleChange = (style: DatacenterStyle) => {
    setSelectedStyle(style)
    // Optionally reset or adjust the design based on the new style
  }

  const handleGridSizeChange = (width: number, height: number) => {
    setGridSize({ width, height })
    // Validate existing placements with new grid size
    const validPlacements = placedModules.filter((placed) => {
      const placedWidth = placed.rotation % 180 === 0 ? placed.module.dim[0] / 10 : placed.module.dim[1] / 10
      const placedHeight = placed.rotation % 180 === 0 ? placed.module.dim[1] / 10 : placed.module.dim[0] / 10

      return placed.position.x + placedWidth <= width && placed.position.y + placedHeight <= height
    })

    setPlacedModules(validPlacements)
  }

  // This will take a current layout and fetch the backend to generate a new layout that will be applied once it receives the rquest
  const genFunction = () => {
    // Implement the generation logic here
    alert("Generation functionality would be implemented here")
  }

  const resetCameraView = () => {
    // Implement the camera reset logic here
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset()
    }
  }

  // Function to load a design from a JSON file
  const handleLoadDesign = async (designData: any) => {
    try {
      // If the style is different from the current one, we change the style
      if (designData.styleId && designData.styleId !== selectedStyle?.id) {
        // Search for the style in the list of available styles
        const newStyle = datacenterStyles.find(style => style.id === designData.styleId);
        if (newStyle) {
          setSelectedStyle(newStyle);
          // If we wanted to change the URL we could also do it like this:
          // router.push(`/designer/${encodeURIComponent(designData.styleId)}`);
        } else {
          console.warn(`Style '${designData.styleId}' not found. Keeping the current style.`);
        }
      }

      // If there are no modules to load, we end here
      if (!designData.modules || !Array.isArray(designData.modules) || designData.modules.length === 0) {
        console.warn("There are no modules to load in the design.");
        return;
      }

      // Get the modules from the API if they have not been loaded yet
      let moduleDefinitions = modules;
      if (moduleDefinitions.length === 0) {
        const response = await fetch("/api/modules");
        moduleDefinitions = await response.json();
        setModules(moduleDefinitions);
      }

      // Map the design modules to the actual modules
      const newPlacedModules: PlacedModule[] = [];

      for (const placedModuleData of designData.modules) {
        // Search for the corresponding module by ID
        const moduleDefinition = moduleDefinitions.find(m => m.id === placedModuleData.id);

        if (moduleDefinition) {
          // Create a new PlacedModule object with the combined data
          const placedModule: PlacedModule = {
            id: `${placedModuleData.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
            module: moduleDefinition,
            position: placedModuleData.position,
            rotation: placedModuleData.rotation || 0
          };

          newPlacedModules.push(placedModule);
        } else {
          console.warn(`Module '${placedModuleData.id}' not found in the module library.`);
        }
      }

      // Replace the current placed modules with the new ones
      setPlacedModules(newPlacedModules);

      // Recalculate the total metrics
      let cost = 0;
      let power = 0;
      let water = 0;
      let area = 0;

      newPlacedModules.forEach((placed) => {
        cost += placed.module.price || 0;
        power += placed.module.usable_power || 0;

        // Calculate water (use the first available value)
        const waterValue = placed.module.fresh_water ||
          placed.module.distilled_water ||
          placed.module.chilled_water || 0;
        water += waterValue;

        // Calculate area
        const moduleWidth = placed.rotation % 180 === 0 ? placed.module.dim[0] : placed.module.dim[1];
        const moduleHeight = placed.rotation % 180 === 0 ? placed.module.dim[1] : placed.module.dim[0];
        area += (moduleWidth * moduleHeight);
      });

      setTotalCost(cost);
      setTotalPower(power);
      setTotalWater(water);
      setTotalArea(area);

      console.log(`Design loaded successfully: ${newPlacedModules.length} modules placed.`);

    } catch (error) {
      console.error("Error loading the design:", error);
      alert("Error loading the design. Please check the file.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Rack Attack</a>
        </h1>
        <div className={styles.metrics}>
          {/* Price Goal Comparison */}
          <div className={styles.metric}>
            <span>Budget:</span>
            {targetPrice > 0 ? ( // Only show if a target price is set
              <span style={{ color: totalCost <= targetPrice ? 'lightgreen' : 'orange' }}>
                ${(targetPrice - totalCost).toLocaleString()} {totalCost <= targetPrice ? 'Remaining' : 'Over'}
              </span>
            ) : (
              <span>${totalCost.toLocaleString()} Spent</span> // Fallback if no target
            )}
          </div>
          {/* Power Balance (Existing) */}
          <div className={styles.metric}>
            <span>Power Balance:</span>
            <span style={{ color: totalPower >= 0 ? 'lightgreen' : 'orange' }}>
              {totalPower >= 0 ? `+${Math.abs(totalPower).toLocaleString()}` : `${totalPower.toLocaleString()}`} kW
            </span>
            {/* Optionally add goal comparison if a 'totalProcessing' state exists and 'goalProcessing' is the target */}
            {/* {goalProcessing > 0 && <span> (Goal: {goalProcessing})</span>} */}
          </div>
          {/* Water Balance (Existing) */}
          <div className={styles.metric}>
            <span>Water Balance:</span>
            <span style={{ color: totalWater >= 0 ? 'lightblue' : 'yellow' }}>
              {totalWater >= 0 ? `+${Math.abs(totalWater).toLocaleString()}` : `${totalWater.toLocaleString()}`} kL
            </span>
            {/* Optionally add goal comparison if 'goalWater' is a target limit/requirement */}
            {/* {goalWater > 0 && <span> (Limit: {goalWater})</span>} */}
          </div>
          {/* Networking Goal Comparison (Assuming 'totalNetwork' state exists or using 0 as placeholder) */}
          <div className={styles.metric}>
            <span>Networking:</span>
            {goalNetwork > 0 ? ( // Only show if a network goal is set
              <span style={{ color: totalExternalNetwork >= goalNetwork ? 'lightgreen' : 'orange' }}>
                {(totalExternalNetwork - goalNetwork).toLocaleString()} {totalExternalNetwork >= goalNetwork ? 'Above Goal' : 'Below Goal'}
              </span>
            ) : (
              <span>{totalExternalNetwork.toLocaleString()} kBps</span> // Fallback if no goal
            )}
          </div>
          {/* Processing Goal Comparison */}
          <div className={styles.metric}>
            <span>Processing:</span>
            {goalProcessing > 0 ? ( // Only show if a target processing is set
              <span style={{ color: totalProcessing >= goalProcessing ? 'lightgreen' : 'orange' }}>
                {totalProcessing.toLocaleString()} {totalProcessing >= goalProcessing ? 'Above Goal' : 'Below Goal'}
              </span>
            ) : (
              <span>{totalProcessing.toLocaleString()} kW</span> // Fallback if no target
            )}


          </div>
          {/* Storage Goal Comparison */}
          <div className={styles.metric}>
            <span>Storage:</span>
            {goalStorage > 0 ? ( // Only show if a target storage is set
              <span style={{ color: totalStorage >= goalStorage ? 'lightgreen' : 'orange' }}>
                {totalStorage.toLocaleString()} {totalStorage >= goalStorage ? 'Storage Balance' : 'Storage Deficit'}
              </span>
            ) : (
              <span>{(totalStorage - goalStorage).toLocaleString()} GB</span> // Fallback if no target
            )}
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <div
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px`, minWidth: '450px', maxWidth: '37vw', flexShrink: 0, position: 'relative' }}
          className={`bg-[#01193d] border-r border-[#0e3e7b] flex flex-col h-[calc(100vh-60px)] overflow-auto ${styles.hideScrollbar}`}
        >
          {/* Divider for resizing that spans the full height */}

          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "6px",
              height: "100%",
              background: "#0e3e7b",
              cursor: "ew-resize",
              zIndex: 10,
              transition: "background 0.2s",
            }}
            className="hover:bg-blue-500"
            onMouseDown={startResizing}
          />

          <ModuleLibrary
            modules={modules}
            onSelectModule={handleModuleSelect}
            selectedModule={selectedModule}
          />

          {selectedModule && (
            <ModuleDetails
              module={selectedModule}
              onClose={() => {
                setSelectedModule(null)
                setIsPlacingModule(false)
              }}
            />
          )}

          <DesignerControls
            datacenterStyles={datacenterStyles}
            selectedStyle={selectedStyle}
            onStyleChange={handleStyleChange}
            gridSize={gridSize}
            onGridSizeChange={handleGridSizeChange}
            placedModules={placedModules}
            onLoadDesign={handleLoadDesign} // Add the onLoadDesign prop
          />
        </div>

        <div className={styles.canvasContainer} style={{ flex: '1', overflow: 'hidden' }}>
          <Canvas camera={{ position: [0, 15, 15], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <DatacenterGrid
              width={gridSize.width}
              height={gridSize.height}
              placedModules={placedModules}
              onPlaceModule={handleModulePlacement}
              onRemoveModule={handleRemoveModule}
              isPlacingModule={isPlacingModule}
              selectedModule={selectedModule}
            />
            <OrbitControls
              ref={orbitControlsRef}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2.1}
              enableZoom={true}
              enablePan={true}
              minDistance={10}
              maxDistance={1000}
              panSpeed={2}
            />
            <Grid
              infiniteGrid={false}
              position={[0, -0.01, 0]}
              args={[gridSize.width, gridSize.height]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6080ff"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#8090ff"
              fadeDistance={1000}
              fadeStrength={1.5}

            />
          </Canvas>
        </div>
      </div>
    </div>
  )
}

