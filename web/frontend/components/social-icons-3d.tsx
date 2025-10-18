"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, memo } from "react";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🔥</div>
        <p className="text-gray-600">Loading 3D...</p>
      </div>
    </div>
  );
}

function GitHubIcon() {
  const { scene } = useGLTF("/models/github.glb");
  return <primitive object={scene} scale={1.5} position={[0, 2, 0]} />;
}

function DiscordIcon() {
  const { scene } = useGLTF("/models/discord.glb");
  return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
}

function TelegramIcon() {
  const { scene } = useGLTF("/models/telegram.glb");
  return <primitive object={scene} scale={1.5} position={[0, -2, 0]} />;
}

function SocialIcons3DContent() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      <GitHubIcon />
      <DiscordIcon />
      <TelegramIcon />
      
      <OrbitControls 
        enableZoom={false}
        autoRotate
        autoRotateSpeed={2}
      />
    </>
  );
}

export const SocialIcons3D = memo(function SocialIcons3D() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 50 }}
          onCreated={() => console.log("Canvas created")}
        >
          <Suspense fallback={null}>
            <SocialIcons3DContent />
          </Suspense>
        </Canvas>
      </Suspense>
    </div>
  );
});
