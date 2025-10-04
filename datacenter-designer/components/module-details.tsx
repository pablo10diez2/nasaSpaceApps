"use client"

import type { Module } from "@/types/datacenter"
import { X } from "lucide-react"

interface ModuleDetailsProps {
  module: Module
  onClose: () => void
}

export default function ModuleDetails({ module, onClose }: ModuleDetailsProps) {

  console.log("ModuleDetails", module)
  // Check if module is valid

  return (
    <div className="p-4 border-t border-[#0e3e7b] flex-shrink-0">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Module Details</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#0a2d5e]">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#88c0d0]">Name:</span>
          <span>{module.id}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#88c0d0]">Dimensions:</span>
          <span>
            {module.dim[0]}m × {module.dim[1]}m
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#88c0d0]">Cost:</span>
          <span>${module.price?.toLocaleString()}</span>
        </div>

        {module.usable_power !== undefined && module.usable_power > 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Power Supply:</span>
            <span className="text-green-400">+{module.usable_power} kW</span>
          </div>
        )}

        {module.usable_power !== undefined && module.usable_power < 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Power Usage:</span>
            <span className="text-red-400">{module.usable_power} kW</span>
          </div>
        )}

        {module.fresh_water !== undefined && module.fresh_water > 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Fresh Water Supply:</span>
            <span className="text-green-400">+{module.fresh_water} kL</span>
          </div>
        )}

        {module.fresh_water !== undefined && module.fresh_water < 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Fresh Water Usage:</span>
            <span className="text-red-400">{module.fresh_water} kL</span>
          </div>
        )}

        {module.distilled_water !== undefined && module.distilled_water > 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Distilled Water Supply:</span>
            <span className="text-green-400">+{module.distilled_water} kL</span>
          </div>
        )}

        {module.distilled_water !== undefined && module.distilled_water < 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Distilled Water Usage:</span>
            <span className="text-red-400">{module.distilled_water} kL</span>
          </div>
        )}

        {module.data_storage !== undefined && module.data_storage > 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Storage Capacity:</span>
            <span className="text-green-400">+{module.data_storage} TB</span>
          </div>
        )}

        {module.internal_network !== undefined && module.internal_network > 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Internal Network Capacity:</span>
            <span className="text-green-400">+{module.internal_network} Gbps</span>
          </div>
        )}

        {module.internal_network !== undefined && module.internal_network < 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Internal Network Usage:</span>
            <span className="text-red-400">{module.internal_network} Gbps</span>
          </div>
        )}

        {module.external_network !== undefined && module.external_network > 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">External Network Capacity:</span>
            <span className="text-green-400">+{module.external_network} Gbps</span>
          </div>
        )}

        {module.external_network !== undefined && module.external_network < 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">External Network Usage:</span>
            <span className="text-red-400">{module.external_network} Gbps</span>
          </div>
        )}

        {module.chilled_water !== undefined && module.chilled_water > 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Chilled Water Supply:</span>
            <span className="text-green-400">+{module.chilled_water} kL</span>
          </div>
        )}

        {module.chilled_water !== undefined && module.chilled_water < 0 && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Chilled Water Usage:</span>
            <span className="text-red-400">{module.chilled_water} kL</span>
          </div>
        )}
      </div>

      {module.description && (
        <div className="mt-4">
          <span className="text-[#88c0d0] text-sm">Description:</span>
          <p className="text-sm mt-1">{module.description}</p>
        </div>
      )}

      <button
        className="w-full mt-4 py-2 bg-[#0e3e7b] hover:bg-[#1a4d8c] rounded text-white transition-colors"
        onClick={() => {
          // This button could be used to place the module or perform other actions
          // For now, we'll just keep the details open
        }}
      >
        Place Module
      </button>
    </div>
  )
}
