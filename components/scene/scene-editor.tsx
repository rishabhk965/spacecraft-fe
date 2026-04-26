'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { SceneJson, SceneObject } from '@/lib/types';

interface SceneEditorProps {
  scene: SceneJson | null;
  selectedObjectId: string | null;
  onSelectObject: (object: SceneObject) => void;
}

export function SceneEditor({ scene, selectedObjectId, onSelectObject }: SceneEditorProps) {
  if (!scene) {
    return (
      <div className="grid h-[520px] place-items-center rounded-3xl border border-dashed border-slate-300 bg-white">
        <p className="max-w-sm text-center text-slate-500">
          Generate a scene from uploaded room images and furniture inputs to start editing.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[520px] overflow-hidden rounded-3xl bg-slate-900">
      <Canvas camera={{ position: [4, 4, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 8, 4]} intensity={1.2} />
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[scene.room.width, scene.room.depth]} />
          <meshStandardMaterial color={scene.room.floorMaterial} />
        </mesh>
        {scene.objects.map((object) => (
          <mesh
            key={object.id}
            position={[object.position.x, object.position.y + 0.4, object.position.z]}
            scale={[object.scale.x, object.scale.y, object.scale.z]}
            onClick={() => onSelectObject(object)}
          >
            <boxGeometry args={boxSizeFor(object.category)} />
            <meshStandardMaterial
              color={object.id === selectedObjectId ? '#F59E0B' : object.material.color}
              roughness={0.65}
            />
          </mesh>
        ))}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

function boxSizeFor(category: string): [number, number, number] {
  if (category === 'sofa' || category === 'bed') return [1.8, 0.7, 0.8];
  if (category === 'table' || category === 'desk') return [1.2, 0.6, 0.8];
  if (category === 'rug') return [1.8, 0.08, 1.2];
  if (category === 'lamp' || category === 'plant') return [0.35, 1.2, 0.35];
  return [0.7, 0.7, 0.7];
}
