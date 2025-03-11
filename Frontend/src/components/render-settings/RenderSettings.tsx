import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { RenderControls } from "./RenderControls";
import { RenderPreview } from "./RenderPreview";
import { FullScreenPreview } from "./FullScreenPreview";

interface RenderSettingsProps {
  productId: number;
}

export function RenderSettings({ productId }: RenderSettingsProps) {
  const [settings, setSettings] = useState({
    horizontalAngle: 0,
    verticalAngle: 0,
    lightEnergy: 50,
    lightAngle: 0,
  });

  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const { toast } = useToast();

  const renderModel = async () => {
    if (!productId) {
      toast({ title: "Ошибка", description: "Товар не найден", variant: "destructive" });
      return;
    }
    setIsRendering(true);
    try {
      const imageBlob = await api.renderModel(
        productId,
        settings.horizontalAngle,
        settings.verticalAngle,
        settings.lightEnergy,
        settings.lightAngle
      );
      setRenderedImage(URL.createObjectURL(imageBlob));
    } catch {
      toast({ title: "Ошибка", description: "Не удалось отрендерить модель", variant: "destructive" });
    } finally {
      setIsRendering(false);
      setIsFirstRender(false);
    }
  };

  useEffect(() => {
    if (productId) {
      renderModel();
    }
  }, [productId, settings]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold ">Рендеринг товара</h2>
        {/* <Button onClick={renderModel} disabled={isRendering} className="flex items-center gap-2">
          <Play className="w-4 h-4" />
        </Button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RenderControls onSettingsChange={setSettings} />

        <div className="flex items-center justify-center ">
          <RenderPreview
            renderedImage={renderedImage}
            isRendering={isRendering}
            isFirstRender={isFirstRender}
            onImageClick={() => setIsFullScreen(true)}
          />
        </div>
      </div>

      <FullScreenPreview renderedImage={renderedImage} isOpen={isFullScreen} onClose={() => setIsFullScreen(false)} />
    </div>
  );
}
