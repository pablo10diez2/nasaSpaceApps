"use client"

import { useState, useRef, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { Vector3, Raycaster, Plane, Vector2 } from "three"
import type { PlacedModule, Module } from "@/types/datacenter"
import ModuleObject from "./module-object"

interface DatacenterGridProps {
  width: number
  height: number
  placedModules: PlacedModule[]
  onPlaceModule: (x: number, y: number, rotation: number) => void
  onRemoveModule: (id: string) => void
  isPlacingModule: boolean
  selectedModule: Module | null
}

export default function DatacenterGrid({
  width,
  height,
  placedModules,
  onPlaceModule,
  onRemoveModule,
  isPlacingModule,
  selectedModule,
}: DatacenterGridProps) {  
  const { camera, gl, scene } = useThree()
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [rotation, setRotation] = useState(0)
  const [isValidPlacement, setIsValidPlacement] = useState(true)
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null)
  const raycaster = useRef(new Raycaster())
  const plane = useRef(new Plane(new Vector3(0, 1, 0), 0))
  const intersection = useRef(new Vector3())
  const mouse = useRef(new Vector2())

  // Handle mouse movement for module placement preview
  useFrame(() => {
    if (isPlacingModule && selectedModule) {
      raycaster.current.setFromCamera(mouse.current, camera)
      if (raycaster.current.ray.intersectPlane(plane.current, intersection.current)) {
        // Convert to grid coordinates
        const x = Math.floor(intersection.current.x + width / 2)
        const z = Math.floor(intersection.current.z + height / 2)

        // Check if position has changed
        if (!hoverPosition || hoverPosition.x !== x || hoverPosition.y !== z) {
          setHoverPosition({ x, y: z })

          // Check if placement is valid
          const isValid = checkPlacementValidity(x, z, selectedModule, rotation)
          setIsValidPlacement(isValid)
        }
      }
    }
  })

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const canvas = gl.domElement
      const rect = canvas.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    // Handle mouse click for module placement
    const handleMouseClick = () => {
      if (isPlacingModule && selectedModule && hoverPosition && isValidPlacement) {
        onPlaceModule(hoverPosition.x, hoverPosition.y, rotation)
      }
    }

    // Handle key press for rotation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "r" && isPlacingModule) {
        setRotation((prev) => (prev + 90) % 360)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleMouseClick)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleMouseClick)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gl, isPlacingModule, selectedModule, hoverPosition, onPlaceModule, rotation, isValidPlacement])

  // Remove module on Backspace
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Backspace" && hoveredModuleId) {
        event.preventDefault();
        onRemoveModule(hoveredModuleId);
        setHoveredModuleId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hoveredModuleId, onRemoveModule]);

  const checkPlacementValidity = (x: number, y: number, module: Module, rotation: number): boolean => {
    if (!module) return false

    // Get module dimensions, accounting for rotation, scaled down by 10x
    const moduleWidth = rotation % 180 === 0 ? module.dim[0] / 10 : module.dim[1] / 10
    const moduleHeight = rotation % 180 === 0 ? module.dim[1] / 10 : module.dim[0] / 10

    // Check if module is within grid bounds
    if (x < 0 || y < 0 || x + moduleWidth > width || y + moduleHeight > height) {
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

  console.log("Placed modules:", placedModules);

  return (
    <>
      {/* Grid outline */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#012456" opacity={0.2} transparent />
      </mesh>
      
      {/* Directional light for strong shadows */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      />

      {/* Grid labels */}
      {Array.from({ length: width + 1 }).map((_, i) => (
        i % 10 === 0 && // Only show every 10th label
        <Text
          key={`x-${i}`}
          position={[i - width / 2, 0.01, -height / 2 - 0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="#88c0d0"
        >
          {i * 10}
        </Text>
      ))}

      {Array.from({ length: height + 1 }).map((_, i) => (

        i % 10 === 0 && // Only show every 10th label
        <Text
          key={`y-${i}`}
          position={[-width / 2 - 0.5, 0.01, i - height / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="#88c0d0"
        >
          {i * 10}
        </Text>

      ))}

      {/* Placed modules */}
      {placedModules.map((placedModule) => (
        <ModuleObject
          key={placedModule.id}
          placedModule={{
            ...placedModule,
            module: {
              ...placedModule.module,
              dim: [placedModule.module.dim[0] / 10, placedModule.module.dim[1] / 10], // Scale down by 10x
            },
          }}
          gridWidth={width}
          gridHeight={height}
          isHovered={hoveredModuleId === placedModule.id}
          setHovered={() => setHoveredModuleId(placedModule.id)}
          unsetHovered={() => setHoveredModuleId(null)}
          onRemove={() => onRemoveModule(placedModule.id)}
        />
      ))}


      {/* Preview of module being placed */}
      {isPlacingModule && selectedModule && hoverPosition && (
        <ModuleObject
          placedModule={{
            id: "preview",
            module: {
              ...selectedModule,
              dim: [selectedModule.dim[0] / 10, selectedModule.dim[1] / 10], // Scale down by 10x
            },
            position: hoverPosition,
            rotation,
          }}
          gridWidth={width}
          gridHeight={height}
          isPreview={true}
          isValidPlacement={isValidPlacement}
        />
      )}
    </>
  )
}
