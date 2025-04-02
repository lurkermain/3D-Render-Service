import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";

function ModelViewer({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      modelRef.current.position.sub(center);
    }
  }, [scene]);

  return (
    <>
      {/* Основное окружающее освещение */}
      <ambientLight intensity={0.5} />
      
      {/* Ключевой направленный свет */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Заполняющий свет с другой стороны */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.5}
      />
      
      {/* Подсветка сверху */}
      <directionalLight
        position={[0, 10, 0]}
        intensity={0.3}
      />
      
      {/* Окружающая среда (опционально) */}
      <Environment preset="city" />
      
      <OrbitControls />
      <primitive ref={modelRef} object={scene} />
    </>
  );
}

export default function ModelViewerWrapper({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Рендеринг товара</h2>
      </div>
      <Suspense fallback={<div>Загрузка модели...</div>}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 50 }} 
          className="w-full h-[600px] bg-gray-100 rounded-lg shadow-md"
          shadows // Включаем поддержку теней
        >
          <ModelViewer modelUrl={modelUrl} />
        </Canvas>
      </Suspense>
    </div>
  );
}