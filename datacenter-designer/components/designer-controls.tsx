"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Import the Next.js router
import type { DatacenterStyle } from "@/types/datacenter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Upload, Save, Trash2 } from "lucide-react"

interface DesignerControlsProps {
  datacenterStyles: DatacenterStyle[]
  selectedStyle: DatacenterStyle | null
  onStyleChange: (style: DatacenterStyle) => void
  gridSize: { width: number; height: number }
  onGridSizeChange: (width: number, height: number) => void
  placedModules: any[] // Add placedModules as prop
  onLoadDesign: (designData: any) => void; // Add this new prop
}

export default function DesignerControls({
  datacenterStyles,
  selectedStyle,
  onStyleChange,
  gridSize,
  onGridSizeChange,
  placedModules, // Add placedModules to destructuring
  onLoadDesign, // Add the new prop here
}: DesignerControlsProps) {
  const [width, setWidth] = useState(gridSize.width)
  const [height, setHeight] = useState(gridSize.height)
  const router = useRouter() // Initialize the router

  // Update local states when props change
  useEffect(() => {
    setWidth(gridSize.width);
    setHeight(gridSize.height);
  }, [gridSize]);

  const handleWidthChange = (value: number[]) => {
    const newWidth = value[0]
    setWidth(newWidth)
    onGridSizeChange(newWidth, height)
  }

  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0]
    setHeight(newHeight)
    onGridSizeChange(width, newHeight)
  }

  const handleStyleSelect = (value: string) => {
    const style = datacenterStyles.find((s) => s.id === value)
    if (style) {
      // Instead of just calling onStyleChange, navigate to the corresponding page
      router.push(`/designer/${encodeURIComponent(style.id)}`)
    }
  }

  const handleSaveDesign = () => {
    // Create object to export with simplified format
    const modules = placedModules.map(pm => ({
      id: pm.module.id,
      position: pm.position,
      rotation: pm.rotation
    }));

    const designData = {
      styleId: selectedStyle?.id,
      modules
    }

    // Convert to JSON and prepare for download
    const dataStr = JSON.stringify(designData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Create download element
    const exportName = `datacenter_design_${selectedStyle?.id || 'custom'}_${new Date().toISOString().slice(0, 10)}.json`

    const a = document.createElement('a')
    a.href = dataUri
    a.download = exportName

    // Trigger click to start download
    document.body.appendChild(a)
    a.click()

    // Cleanup
    document.body.removeChild(a)
    URL.revokeObjectURL(dataUri)
  }

  const handleSaveInDB = async () => {
    // Create object to export with simplified format
    const modules = placedModules.map(pm => ({
      id: pm.module.id,
      position: pm.position,
      rotation: pm.rotation
    }));

    const designData = {
      styleId: selectedStyle?.id,
      modules
    }

    try {
      // Send data to the server
      const response = await fetch(`/api/datacenters/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save datacenter: ${response.status}`);
      }

      const result = await response.json();
      alert(`Datacenter saved successfully! ID: ${result.id || 'unknown'}`);
    } catch (err) {
      console.error('Error saving datacenter to DB:', err);
      alert('Failed to save datacenter to database. Please try again.');
    }
  }

  const handleLoadDesign = () => {
    // Create a hidden file input to select the file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const designData = JSON.parse(e.target?.result as string);
          if (!designData || !designData.modules) {
            alert("Invalid file format");
            return;
          }

          // Check if we need to change page first
          if (designData.styleId && designData.styleId !== selectedStyle?.id) {
            // Temporarily store the design in localStorage to retrieve it after redirection
            localStorage.setItem('pendingDesignData', JSON.stringify(designData));

            // Redirect to the corresponding style page
            router.push(`/designer/${encodeURIComponent(designData.styleId)}`);
          } else {
            // If we don't need to change the style, load directly
            onLoadDesign(designData);
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Error loading design: Invalid format");
        }
      };
      reader.readAsText(file);
    };

    // Trigger the click on the input
    input.click();
  }

  // Add function to clear the design
  const handleClearDesign = () => {
    // Confirm with the user before deleting everything
    if (placedModules.length > 0) {
      if (confirm("Are you sure you want to remove all modules from the grid?")) {
        // Dispatch event to clear all modules
        const event = new CustomEvent('clearAllModules');
        window.dispatchEvent(event);
      }
    }
  }

  return (
    <div className="p-4 border-t border-[#0e3e7b] flex-shrink-0">
      <h3 className="text-lg font-bold mb-4">Designer Controls</h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-[#88c0d0]">Datacenter Style</label>
          <Select
            value={selectedStyle?.id || ""}
            onValueChange={handleStyleSelect}
            defaultValue={selectedStyle?.id}
          >
            <SelectTrigger className="bg-[#011845] border-[#0e3e7b]">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent className="bg-[#011845] border-[#0e3e7b]">
              {datacenterStyles.map((style) => (
                <SelectItem
                  key={style.id}
                  value={style.id}
                  className="bg-primary text-[#88c0d0] hover:bg-[#0a2d5e]"
                >
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStyle && <p className="text-xs mt-1 text-[#a9c4d4]">{selectedStyle.description}</p>}
        </div>

        {/* <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-[#88c0d0]">Grid Width</label>
            <span className="text-sm">{width}m</span>
          </div>
          <Slider value={[width]} min={10} max={50} step={1} onValueChange={handleWidthChange} className="py-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-[#88c0d0]">Grid Height</label>
            <span className="text-sm">{height}m</span>
          </div>
          <Slider value={[height]} min={10} max={50} step={1} onValueChange={handleHeightChange} className="py-2" />
        </div> */}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white"
            onClick={handleSaveDesign}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white"
            onClick={handleSaveInDB}
          >
            <Save className="mr-2 h-4 w-4" />
            Save in DB
          </Button>
          <Button
            variant="outline"
            className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white"
            onClick={handleLoadDesign}
          >
            <Upload className="mr-2 h-4 w-4" />
            Load
          </Button>
          <Button
            variant="outline"
            className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white col-span-2"
            onClick={handleClearDesign}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Design
          </Button>
        </div>
      </div>
    </div>
  )
}
