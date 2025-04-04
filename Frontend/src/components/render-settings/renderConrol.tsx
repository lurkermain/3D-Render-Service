import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RenderControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function RenderControl({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: RenderControlProps) {
  const [localValue, setLocalValue] = useState(value);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
          {localValue}{unit}
        </span>
      </div>

      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[localValue]}
        onValueChange={(val) => setLocalValue(val[0])} // Обновляем локальное состояние
        onValueCommit={(val) => onChange(val[0])} // Передаём финальное значение только при отпускании
        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
      />
    </div>
  );
}
