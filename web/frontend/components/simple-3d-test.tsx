"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function RotatingCube() {
  return (
    <mesh rotation={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export function Simple3DTest() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RotatingCube />
        <OrbitControls autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}
