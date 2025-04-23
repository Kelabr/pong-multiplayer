"use client"

import { ChevronUp, ChevronDown } from "lucide-react"

interface MobileControlsProps {
  onMoveUp: () => void
  onMoveDown: () => void
  onStopMoving: () => void
}

export function MobileControls({ onMoveUp, onMoveDown, onStopMoving }: MobileControlsProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 flex justify-between z-10">
      <div className="flex flex-col gap-2">
        <button
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm active:bg-white/30 touch-none"
          onTouchStart={onMoveUp}
          onTouchEnd={onStopMoving}
          aria-label="Mover para cima"
        >
          <ChevronUp className="w-8 h-8 text-white" />
        </button>
        <button
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm active:bg-white/30 touch-none"
          onTouchStart={onMoveDown}
          onTouchEnd={onStopMoving}
          aria-label="Mover para baixo"
        >
          <ChevronDown className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  )
}
