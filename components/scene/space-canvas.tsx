'use client';

import { Grid, Html, OrbitControls, Stars } from '@react-three/drei';
import { Physics, useBox, useCylinder, useSphere } from '@react-three/cannon';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { MutableRefObject, useCallback, useMemo, useRef } from 'react';
import { Group, Plane, Vector3 as ThreeVector3 } from 'three';
import { PrimitiveShapeType, SpaceItem, SpaceItemDimensions, ThemeDefinition } from '@/lib/types';

interface SpaceCanvasProps {
  items: SpaceItem[];
  theme?: ThemeDefinition | null;
  onItemsChange?: (items: SpaceItem[]) => void;
}

export function SpaceCanvas({ items, theme, onItemsChange }: SpaceCanvasProps) {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950 shadow-2xl shadow-indigo-950/30">
      <Canvas camera={{ position: [5, 4, 7], fov: 48 }}>
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 10, 30]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 4]} intensity={1.4} />
        <pointLight position={[-5, 4, -5]} color={theme?.designSpecs.colorPalette[0] ?? '#38bdf8'} intensity={32} />
        <Stars radius={80} depth={35} count={1600} factor={3} fade speed={0.8} />
        <Grid
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.45}
          cellColor="#475569"
          sectionSize={5}
          sectionThickness={1.1}
          sectionColor={theme?.designSpecs.colorPalette[1] ?? '#38bdf8'}
          fadeDistance={28}
          fadeStrength={1}
          infiniteGrid
          position={[0, -0.02, 0]}
        />
        <Physics gravity={[0, -9.81, 0]} allowSleep>
          <PhysicsGround />
          {items.map((item, index) => (
            <PhysicsSpaceItem
              key={item.name}
              item={item}
              index={index}
              items={items}
              theme={theme}
              onItemsChange={onItemsChange}
            />
          ))}
        </Physics>
        <OrbitControls enablePan enableZoom minDistance={3} maxDistance={18} />
      </Canvas>
    </div>
  );
}

function PhysicsGround() {
  useBox(() => ({
    args: [40, 0.1, 40],
    position: [0, -0.08, 0],
    type: 'Static',
  }));
  return null;
}

function PhysicsSpaceItem(props: PhysicsItemProps) {
  const shapeType = props.item.shapeType ?? shapeForItem(props.item.name);

  if (shapeType === 'cylinder') {
    return <PhysicsCylinderItem {...props} />;
  }

  if (shapeType === 'sphere') {
    return <PhysicsSphereItem {...props} />;
  }

  return <PhysicsBoxItem {...props} />;
}

function PhysicsBoxItem(props: PhysicsItemProps) {
  const dimensions = props.item.dimensions ?? fallbackDimensionsForItem(props.item.name);
  const [ref, api] = useBox<Group>(() => ({
    args: [dimensions.width, dimensions.height, dimensions.depth],
    fixedRotation: true,
    linearDamping: 0.92,
    mass: massForItem(props.item),
    position: props.item.position,
    rotation: props.item.rotation,
    type: massForItem(props.item) === 0 ? 'Static' : 'Dynamic',
  }));

  return <PhysicsItemShell {...props} api={api} bodyRef={ref} dimensions={dimensions} shapeType="box" />;
}

function PhysicsCylinderItem(props: PhysicsItemProps) {
  const dimensions = props.item.dimensions ?? fallbackDimensionsForItem(props.item.name);
  const radius = Math.max(dimensions.width, dimensions.depth) / 2;
  const [ref, api] = useCylinder<Group>(() => ({
    args: [radius, radius, dimensions.height, 24],
    fixedRotation: true,
    linearDamping: 0.92,
    mass: massForItem(props.item),
    position: props.item.position,
    rotation: props.item.rotation,
    type: massForItem(props.item) === 0 ? 'Static' : 'Dynamic',
  }));

  return <PhysicsItemShell {...props} api={api} bodyRef={ref} dimensions={dimensions} shapeType="cylinder" />;
}

function PhysicsSphereItem(props: PhysicsItemProps) {
  const dimensions = props.item.dimensions ?? fallbackDimensionsForItem(props.item.name);
  const radius = Math.max(dimensions.width, dimensions.height, dimensions.depth) / 2;
  const [ref, api] = useSphere<Group>(() => ({
    args: [radius],
    fixedRotation: true,
    linearDamping: 0.92,
    mass: massForItem(props.item),
    position: props.item.position,
    rotation: props.item.rotation,
    type: massForItem(props.item) === 0 ? 'Static' : 'Dynamic',
  }));

  return <PhysicsItemShell {...props} api={api} bodyRef={ref} dimensions={dimensions} shapeType="sphere" />;
}

interface PhysicsItemProps {
  item: SpaceItem;
  index: number;
  items: SpaceItem[];
  theme?: ThemeDefinition | null;
  onItemsChange?: (items: SpaceItem[]) => void;
}

type PhysicsApi = ReturnType<typeof useBox<Group>>[1];

function PhysicsItemShell({
  item,
  index,
  items,
  theme,
  onItemsChange,
  api,
  bodyRef,
  dimensions,
  shapeType,
}: PhysicsItemProps & {
  api: PhysicsApi;
  bodyRef: MutableRefObject<Group | null>;
  dimensions: SpaceItemDimensions;
  shapeType: PrimitiveShapeType;
}) {
  const latestPosition = useRef<SpaceItem['position']>(item.position);
  const isDragging = useRef(false);
  const pointerOffset = useRef(new ThreeVector3());
  const floorPlane = useMemo(() => new Plane(new ThreeVector3(0, 1, 0), 0), []);
  const { camera, raycaster, pointer, gl } = useThree();
  const color = useMemo(
    () => item.material?.color ?? theme?.designSpecs.colorPalette[index % theme.designSpecs.colorPalette.length] ?? '#38bdf8',
    [index, item.material?.color, theme],
  );
  const canDrag = item.isDraggable !== false;

  useFrame(() => {
    const current = bodyRef.current?.position;
    if (!current || isDragging.current) return;
    const next: SpaceItem['position'] = [
      current.x + (item.position[0] - current.x) * 0.08,
      current.y + (item.position[1] - current.y) * 0.08,
      current.z + (item.position[2] - current.z) * 0.08,
    ];
    latestPosition.current = next;
    api.position.set(...next);
    api.rotation.set(item.rotation[0], item.rotation[1], item.rotation[2]);
    api.velocity.set(0, 0, 0);
  });

  const pointOnFloor = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const point = new ThreeVector3();
    raycaster.ray.intersectPlane(floorPlane, point);
    return point;
  }, [camera, floorPlane, pointer, raycaster]);

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!canDrag) return;
      event.stopPropagation();
      isDragging.current = true;
      const floorPoint = pointOnFloor();
      pointerOffset.current.set(latestPosition.current[0] - floorPoint.x, 0, latestPosition.current[2] - floorPoint.z);
      api.mass.set(0);
      gl.domElement.setPointerCapture(event.pointerId);
    },
    [api.mass, canDrag, gl.domElement, pointOnFloor],
  );

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!isDragging.current) return;
      event.stopPropagation();
      const floorPoint = pointOnFloor();
      const next: SpaceItem['position'] = [
        Number((floorPoint.x + pointerOffset.current.x).toFixed(3)),
        item.position[1],
        Number((floorPoint.z + pointerOffset.current.z).toFixed(3)),
      ];
      latestPosition.current = next;
      api.position.set(...next);
      api.velocity.set(0, 0, 0);
    },
    [api.position, api.velocity, item.position, pointOnFloor],
  );

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!isDragging.current) return;
      event.stopPropagation();
      isDragging.current = false;
      api.mass.set(massForItem(item));
      gl.domElement.releasePointerCapture(event.pointerId);
      onItemsChange?.(
        items.map((existing) =>
          existing.name === item.name
            ? {
                ...existing,
                position: latestPosition.current,
              }
            : existing,
        ),
      );
    },
    [api.mass, gl.domElement, item, items, onItemsChange],
  );

  return (
    <group
      ref={bodyRef}
      position={item.position}
      rotation={item.rotation}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <mesh castShadow receiveShadow>
        <PrimitiveGeometry shapeType={shapeType} dimensions={dimensions} />
        <meshStandardMaterial color={color} roughness={0.48} metalness={metalnessForItem(item)} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.max(dimensions.width, dimensions.depth) * 0.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <Html center distanceFactor={8} position={[0, dimensions.height + 0.18, 0]}>
        <span className="rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-white shadow">
          {item.name}
        </span>
      </Html>
    </group>
  );
}

function PrimitiveGeometry({ shapeType, dimensions }: { shapeType: PrimitiveShapeType; dimensions: SpaceItemDimensions }) {
  if (shapeType === 'cylinder') {
    const radius = Math.max(dimensions.width, dimensions.depth) / 2;
    return <cylinderGeometry args={[radius, radius, dimensions.height, 32]} />;
  }
  if (shapeType === 'sphere') {
    const radius = Math.max(dimensions.width, dimensions.height, dimensions.depth) / 2;
    return <sphereGeometry args={[radius, 32, 16]} />;
  }
  return <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />;
}

function fallbackDimensionsForItem(name: string): SpaceItemDimensions {
  const normalized = name.toLowerCase();
  if (normalized.includes('bed')) return { width: 1.8, height: 0.45, depth: 1.25, unit: 'm' };
  if (normalized.includes('desk') || normalized.includes('table')) return { width: 1.25, height: 0.5, depth: 0.75, unit: 'm' };
  if (normalized.includes('lamp') || normalized.includes('sign')) return { width: 0.32, height: 1.2, depth: 0.32, unit: 'm' };
  if (normalized.includes('blanket') || normalized.includes('rug')) return { width: 1.5, height: 0.08, depth: 1.05, unit: 'm' };
  if (normalized.includes('sofa')) return { width: 1.7, height: 0.65, depth: 0.8, unit: 'm' };
  return { width: 0.7, height: 0.7, depth: 0.7, unit: 'm' };
}

function shapeForItem(name: string): PrimitiveShapeType {
  const normalized = name.toLowerCase();
  if (normalized.includes('lamp') || normalized.includes('plant')) return 'cylinder';
  if (normalized.includes('globe') || normalized.includes('sphere')) return 'sphere';
  return 'box';
}

function massForItem(item: SpaceItem): number {
  if (typeof item.mass === 'number') return item.mass;
  const normalized = item.name.toLowerCase();
  if (normalized.includes('rug') || normalized.includes('blanket') || normalized.includes('neon') || normalized.includes('sign')) return 0;
  const dimensions = item.dimensions ?? fallbackDimensionsForItem(item.name);
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  return Number(Math.min(4, Math.max(1, volume * 1.4)).toFixed(2));
}

function metalnessForItem(item: SpaceItem): number {
  const normalized = item.name.toLowerCase();
  return item.material?.finish === 'metal' || normalized.includes('metal') || normalized.includes('neon') ? 0.35 : 0.08;
}
