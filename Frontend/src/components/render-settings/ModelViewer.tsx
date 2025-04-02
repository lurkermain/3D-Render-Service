import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";

function ModelViewer({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (modelRef.current) {
      // Вычисляем центр модели и настраиваем позицию
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      modelRef.current.position.sub(center); // Смещаем модель в центр
    }
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      <OrbitControls />
      <primitive ref={modelRef} object={scene} />
    </>
  );
}

export default function ModelViewerWrapper({ modelUrl }: { modelUrl: string }) {
  return (
    <Suspense fallback={<div>Загрузка модели...</div>}>
      <Canvas camera={{ position: [0, 0, 5] }} className="w-full h-96 bg-gray-100 rounded-lg shadow-md">
        <ModelViewer modelUrl={modelUrl} />
      </Canvas>
    </Suspense>
  );
}
