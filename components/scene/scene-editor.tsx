'use client';

import { Grid, OrbitControls, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { PrimitiveShapeType, SceneJson, SceneObject, Vector3 } from '@/lib/types';

interface SceneEditorProps {
  scene: SceneJson | null;
  selectedObjectId: string | null;
  onSelectObject: (object: SceneObject) => void;
}

export function SceneEditor({ scene, selectedObjectId, onSelectObject }: SceneEditorProps) {
  if (!scene) {
    return (
      <div className="grid h-[560px] place-items-center rounded-[2rem] border border-dashed border-white/30 bg-slate-950/90 p-8 text-center text-white shadow-2xl shadow-indigo-950/30">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">Infinite 3D canvas</p>
          <p className="mt-4 max-w-md text-slate-300">
            Define the space, add images or items, and generate a spatial preview to begin exploring.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[560px] overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950 shadow-2xl shadow-indigo-950/40">
      <Canvas camera={{ position: [6, 5, 8], fov: 48 }}>
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 10, 36]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[6, 10, 5]} intensity={1.3} />
        <pointLight position={[-8, 5, -8]} color="#38bdf8" intensity={40} />
        <Stars radius={90} depth={45} count={2600} factor={4} fade speed={1} />
        <Grid
          args={[80, 80]}
          cellSize={1}
          cellThickness={0.45}
          cellColor="#475569"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#38bdf8"
          fadeDistance={36}
          fadeStrength={1}
          infiniteGrid
          position={[0, -0.02, 0]}
        />
        <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[Math.max(scene.room.width, scene.room.depth) / 2, 72]} />
          <meshStandardMaterial color={scene.room.floorMaterial || '#0f172a'} transparent opacity={0.58} />
        </mesh>
        {scene.objects.map((object) => (
          <group key={object.id} position={[object.position.x, object.position.y + 0.38, object.position.z]}>
            <mesh
              rotation={[object.rotation.x, object.rotation.y, object.rotation.z]}
              onClick={() => onSelectObject(object)}
            >
              <PrimitiveGeometry shapeType={object.shapeType ?? shapeForCategory(object.category)} scale={object.scale} />
              <meshStandardMaterial
                color={object.id === selectedObjectId ? '#F59E0B' : object.material.color}
                roughness={0.55}
                metalness={0.08}
              />
            </mesh>
            <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.62, 32]} />
              <meshBasicMaterial color={object.material.color} transparent opacity={0.16} />
            </mesh>
          </group>
        ))}
        <OrbitControls enablePan enableZoom minDistance={4} maxDistance={22} />
      </Canvas>
    </div>
  );
}

function PrimitiveGeometry({ shapeType, scale }: { shapeType: PrimitiveShapeType; scale: Vector3 }) {
  if (shapeType === 'cylinder') {
    const radius = Math.max(scale.x, scale.z) / 2;
    return <cylinderGeometry args={[radius, radius, scale.y, 32]} />;
  }
  if (shapeType === 'sphere') {
    const radius = Math.max(scale.x, scale.y, scale.z) / 2;
    return <sphereGeometry args={[radius, 32, 16]} />;
  }
  return <boxGeometry args={[scale.x, scale.y, scale.z]} />;
}

function shapeForCategory(category: string): PrimitiveShapeType {
  if (category === 'lamp' || category === 'plant') return 'cylinder';
  return 'box';
}
