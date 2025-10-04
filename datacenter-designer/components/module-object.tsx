"use client"

import { useState, Suspense } from "react"
import { Text } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { OBJLoader, MTLLoader } from "three-stdlib"
import type { PlacedModule } from "@/types/datacenter"

interface ModuleObjectProps {
  placedModule: PlacedModule
  gridWidth: number
  gridHeight: number
  isPreview?: boolean
  isValidPlacement?: boolean
  onRemove?: () => void
  isHovered?: boolean
  setHovered?: () => void
  unsetHovered?: () => void
}

// Always call useLoader, let Suspense handle loading/failure
function ModuleModel({ moduleId, width, depth, color }: { moduleId: string; width: number; depth: number; color: string }) {
  let obj: any = null
  try {
    const materials = useLoader(MTLLoader, `/models/${moduleId}.mtl`)
    obj = useLoader(OBJLoader, `/models/${moduleId}.obj`, loader => {
      loader.setMaterials(materials)
    })
  } catch {
    try {
      obj = useLoader(OBJLoader, `/models/${moduleId}.obj`)
    } catch {
      obj = null
    }
  }

  // If obj is null, render a fallback box
  if (!obj) {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial color={color} opacity={0.7} transparent />
      </mesh>
    )
  }

  // Force color on all meshes
  obj.traverse?.((child: any) => {
    if (child.isMesh) {
      // Deep clone the material so each mesh is unique
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat: any) => {
            const cloned = mat.clone ? mat.clone() : mat;
            if (cloned && cloned.color && cloned.color.set) cloned.color.set(color);
            return cloned;
          });
        } else {
          if (child.material.clone) {
            child.material = child.material.clone();
            if (child.material.color && child.material.color.set) {
              child.material.color.set(color);
            }
          } else if (child.material.color && child.material.color.set) {
            child.material.color.set(color);
          }
        }
      }
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  let position = [0, width / 3, 0]
  let scale = [width / 2, width / 2, depth / 2]
  if (moduleId.includes("water_supply") || moduleId.includes("water_treatment")) {
    position = [0, 0, 0]
    scale = [width / 3, width / 4, depth / 3]
  }
  if (moduleId.includes("water_chiller")) {
    position = [0, 0, 0]
    scale = [width / 2, 5, depth / 2]
  }
  if (moduleId.includes("water_treatment")) {
    position = [0, 0, 0]
    scale = [width / 2.5, 2 + width / 40, depth / 1.5]
  }
  if (moduleId.includes("_rack")) {
    position = [0, 1.5, 0]
    scale = [width * 1.3, width, depth * 2]
  }

  return (
    <primitive
      object={obj.clone()}
      position={position}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}

export default function ModuleObject({
  placedModule,
  gridWidth,
  gridHeight,
  isPreview = false,
  isValidPlacement = true,
  onRemove,
  isHovered = false,
  setHovered,
  unsetHovered,
}: ModuleObjectProps) {
  const { module, position, rotation } = placedModule

  // Calculate dimensions based on rotation
  const rotated = rotation % 180 !== 0
  const width = rotated ? module.dim[1] : module.dim[0]
  const depth = rotated ? module.dim[0] : module.dim[1]

  // Center of the module in grid coordinates
  const x = position.x - gridWidth / 2 + width / 2
  const z = position.y - gridHeight / 2 + depth / 2

  // Determine color based on module type and state
  let color = "#0e3e7b" // Default blue
  let opacity = 0.8

  if (isPreview) {
    opacity = 0.5
    color = isValidPlacement ? "#4CAF50" : "#F44336"
  } else if (isHovered) {
    color = "#1a4d8c"
  } else {
    switch (module.type) {
      case "transformer":
        color = "#FFC107"
        break
      case "water supply":
      case "water treatment":
      case "water chiller":
        color = "#84e080"
        break
      case "network rack":
        color = "#9C27B0"
        break
      case "data rack":
        color = "#FF5722"
        break
      case "server rack":
        color = "#4CAF50"
        break
      default:
        color = "#0e3e7b"
    }
  }

  console.log("Object ID ", module.id, module.dim[0], module.dim[1], " color ", color);

  return (
    <group
      position={[x, 0.5, z]}
      rotation={[0, (rotation * Math.PI) / 180, 0]}
      onPointerOver={setHovered}
      onPointerOut={unsetHovered}
      onClick={(e) => {
        if (!isPreview && onRemove && e.button === 2) {
          e.stopPropagation()
          onRemove()
        }
      }}
    >
      {/* Module base */}
      <mesh>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial color={color} opacity={opacity} transparent />
      </mesh>

      {/* Render OBJ model if available */}
      <Suspense fallback={null}>
        <ModuleModel moduleId={module.id} width={width} depth={depth} color={color} />
      </Suspense>

      {/* Module label */}
      <Text
        position={[0, 0.6, depth / 2 - 0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.7}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.2}
      >
        {module.id}
      </Text>

      {/* Module details (only show when hovered and not a preview) */}
      {isHovered && !isPreview && (
        <Text
          position={[0, 0.6, depth / 2 - 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.6}
          color="#88c0d0"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.2}
        >
          {`${width * 10}x${depth * 10}m • $${module.price}`}
        </Text>
      )}
    </group>
  )
}

