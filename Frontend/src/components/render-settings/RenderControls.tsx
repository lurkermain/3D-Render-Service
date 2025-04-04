import { useState } from "react";
import { RenderControl } from "./renderConrol";

interface RenderControlsProps {
  onSettingsChange: (settings: {
    horizontalAngle: number;
    verticalAngle: number;
    lightEnergy: number;
    lightAngle: number;
  }) => void;
}

export function RenderControls({ onSettingsChange }: RenderControlsProps) {
  const [horizontalAngle, setHorizontalAngle] = useState(0);
  const [verticalAngle, setVerticalAngle] = useState(0);
  const [lightEnergy, setLightEnergy] = useState(50);
  const [lightAngle, setLightAngle] = useState(0);

  // Обновление настроек только при отпускании слайдера
  const handleChange = (key: string, value: number) => {
    const newSettings = {
      horizontalAngle,
      verticalAngle,
      lightEnergy,
      lightAngle,
      [key]: value, // обновляем только изменённое значение
    };

    if (key === "horizontalAngle") setHorizontalAngle(value);
    if (key === "verticalAngle") setVerticalAngle(value);
    if (key === "lightEnergy") setLightEnergy(value);
    if (key === "lightAngle") setLightAngle(value);

    onSettingsChange(newSettings); // Срабатывает только после отпускания слайдера
  };

  console.log(horizontalAngle)
  return (
    <div className="space-y-4">
      <RenderControl
        id="horizontalAngle"
        label="Горизонтальный угол"
        value={horizontalAngle}
        min={-90}
        max={90}
        unit="°"
        onChange={(value) => handleChange("horizontalAngle", value)}
      />
      <RenderControl
        id="verticalAngle"
        label="Вертикальный угол"
        value={verticalAngle}
        min={-90}
        max={90}
        unit="°"
        onChange={(value) => handleChange("verticalAngle", value)}
      />
      <RenderControl
        id="lightEnergy"
        label="Яркость света"
        value={lightEnergy}
        min={0}
        max={100}
        unit="%"
        onChange={(value) => handleChange("lightEnergy", value)}
      />
      <RenderControl
        id="lightAngle"
        label="Угол света"
        value={lightAngle}
        min={-180}
        max={180}
        unit="°"
        onChange={(value) => handleChange("lightAngle", value)}
      />
    </div>
  );
}
