import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RenderControlsProps {
  horizontalAngle: number;
  verticalAngle: number;
  lightEnergy: number;
  lightAngle: number;
  onHorizontalAngleChange: (value: number) => void;
  onVerticalAngleChange: (value: number) => void;
  onLightEnergyChange: (value: number) => void;
  onLightAhgleChange: (value: number) => void;
}

export function RenderControls({
  horizontalAngle,
  verticalAngle,
  lightEnergy,
  lightAngle,
  onHorizontalAngleChange,
  onVerticalAngleChange,
  onLightEnergyChange,
  onLightAhgleChange,
}: RenderControlsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {/* <div className="flex items-center justify-between py-1 ">
          <Label htmlFor="horizontalAngle">Горизонтальный угол</Label>
        </div> */}
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Горизонтальный угол</Label>
          <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
            {horizontalAngle}°
          </span>
        </div>
        <Slider
          id="horizontalAngle"
          min={-90}
          max={90}
          step={1}
          value={[horizontalAngle]}
          onValueChange={(value) => onHorizontalAngleChange(value[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
        />
      </div>

      <div className="grid gap-4">
        {/* <div className="flex items-center justify-between py-1 ">
          <Label htmlFor="verticalAngle">Вертикальный угол</Label>
        </div> */}
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Вертикальный угол</Label>
          <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
            {verticalAngle}°
          </span>
        </div>
        <Slider
          id="verticalAngle"
          min={-90}
          max={90}
          step={1}
          value={[verticalAngle]}
          onValueChange={(value) => onVerticalAngleChange(value[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"

        />
      </div>

      <div className="grid gap-4">
        {/* <div className="flex items-center justify-between py-1 ">
          <Label htmlFor="lightEnergy">Яркость света</Label>
        </div> */}
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Яркость света</Label>
          <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
            {lightEnergy}%
          </span>
        </div>
        <Slider
          id="lightEnergy"
          min={0}
          max={100}
          step={1}
          value={[lightEnergy]}
          onValueChange={(value) => onLightEnergyChange(value[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"

        />
      </div>
      <div className="grid gap-4">
        {/* <div className="flex items-center justify-between py-1 ">
          <Label htmlFor="lightAngle">Угол света</Label>
        </div> */}
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Угол света</Label>
          <span className="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
            {lightAngle}°
          </span>
        </div>
        <Slider
          id="lightAngle"
          min={-180}
          max={180}
          step={1}
          value={[lightAngle]}
          onValueChange={(value) => onLightAhgleChange(value[0])}
          className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"

        />
      </div>
    </div>
  );
} 