"use client"

import { useEffect, useState, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Sun } from "lucide-react"
import { api } from "@/lib/api"

// Описываем глобально тип для model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        alt?: string
        "camera-controls"?: boolean
        "shadow-intensity"?: string
        "environment-image"?: string
        exposure?: number
        "min-camera-orbit"?: string
        "max-camera-orbit"?: string
        "camera-orbit"?: string
        "field-of-view"?: string
      }
    }
  }
}

// Описываем тип для model-viewer
interface HTMLModelViewerElement extends HTMLElement {
  exposure?: number
}

export default function ModelViewer({ productId }: { productId: number }) {
    const [modelUrl, setModelUrl] = useState<string | null>(null)
    const [isModelViewerDefined, setIsModelViewerDefined] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Указываем, что ref относится к model-viewer
    const modelViewerRef = useRef<HTMLModelViewerElement | null>(null)

    useEffect(() => {
        import("@google/model-viewer").then(() => setIsModelViewerDefined(true))
    }, [])

    useEffect(() => {
        if (productId) {
            const fetchModel = async () => {
                setIsLoading(true);
                setError(null);
              
                try {
                  const url = await api.getModel(productId);
                  setModelUrl(url);
                } catch (err) {
                  setError("Не удалось загрузить модель");
                } finally {
                  setIsLoading(false);
                }
              };
            fetchModel()
        }
    }, [productId])

    const handleLightIntensityChange = (value: number[]) => {
        if (modelViewerRef.current) {
            modelViewerRef.current.exposure = value[0] // Теперь TypeScript не ругается
        }
    }

    return (
        <div className="container mx-auto">
        <h2 className="text-lg font-bold ">Рендеринг товара</h2>

            <div className="lg:col-span-2 bg-white rounded-lg overflow-hidden h-[500px] flex items-center justify-center">
                {isLoading ? (
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 rounded-full animate-spin border-4 border-t-black border-solid"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    isModelViewerDefined && modelUrl && (
                        // @ts-ignore 
                        <model-viewer
                            ref={modelViewerRef}
                            src={modelUrl}
                            alt="3D model"
                            camera-controls
                            shadow-intensity="1"
                            environment-image="neutral"
                            exposure={1} // Теперь TypeScript принимает этот атрибут
                            min-camera-orbit="auto auto 13m"
                            max-camera-orbit="auto auto 10m"
                            camera-orbit="0deg 75deg 1m"
                            field-of-view="30deg"
                            style={{ width: "100%", height: "100%" }}
                            // @ts-ignore 
                        ></model-viewer>
                    )
                )}
            </div>

            {!isLoading && !error && (
                <div className="mt-4 px-4">
                    <div className="flex items-center mb-2">
                        <Sun className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">Light Intensity</span>
                    </div>
                    <Slider defaultValue={[1]} min={0} max={2} step={0.01} onValueChange={handleLightIntensityChange} />
                </div>
            )}
        </div>
    )
}
