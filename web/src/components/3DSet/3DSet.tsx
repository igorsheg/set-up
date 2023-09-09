import * as THREE from "three";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Billboard,
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
  OrbitControls,
  Text,
} from "@react-three/drei";
import { a, useTransition } from "@react-spring/three";
import { RoundedBoxGeometry } from "three-stdlib";

function Geometry({ position, geometry, isBox, color, ...props }) {
  const materialConfig = {
    backside: false,
    samples: 16,
    resolution: 64,
    transmission: 1,
    roughness: 0.5,
    clearcoat: 0.1,
    clearcoatRoughness: 0.1,
    thickness: 0.2,
    backsideThickness: 0.2,
    ior: 1.5,
    chromaticAberration: 1,
    anisotropy: 1,
    distortion: 0,
    distortionScale: 0.2,
    temporalDistortion: 0,
    attenuationDistance: 0.5,
    attenuationColor: "#ffffff",
    color: "#ffffff",
    toneMapped: false,
  };

  return (
    <group position={position}>
      <Float rotationIntensity={0} speed={2}>
        <a.mesh
          receiveShadow
          castShadow
          renderOrder={100}
          {...props}
          geometry={geometry}
        >
          <MeshTransmissionMaterial {...materialConfig} color={color} />
        </a.mesh>
      </Float>
    </group>
  );
}

function Geometries({ items }) {
  const transition = useTransition(items, {
    from: { scale: [0, 0, 0], rotation: [0, 0, 0] },
    enter: ({ r }) => ({ scale: [1, 1, 1], rotation: [r * 3, r * 3, r * 3] }),
    leave: { scale: [0.1, 0.1, 0.1], rotation: [0, 0, 0] },
    config: { mass: 5, tension: 1000, friction: 100 },
    trail: 100,
  });
  return transition(
    (props, { position: [x, y, z], r, geometry, color, isBox }) => (
      <Geometry
        position={[x * 3, y * 3, z]}
        geometry={geometry}
        color={color}
        r={r}
        isBox={isBox}
        {...props}
      />
    ),
  );
}

export const SetScene = () => {
  const [items] = useState([
    {
      position: [0, 0, 3],
      r: 0,
      geometry: new RoundedBoxGeometry(2.5, 2.5, 2.5),
      isBox: true,
      color: "#3D7773",
    },
    {
      position: [0.6, 0, 0],
      r: 0,
      geometry: new THREE.TetrahedronGeometry(2),
      color: "#F8503E",
    },
    {
      position: [-0.6, 0, 0],
      r: 0.4,
      geometry: new THREE.SphereGeometry(1.5, 32, 32),
      color: "#414E9B",
    },
  ]);

  return (
    <Canvas style={{ height: 300 }} camera={{ position: [0, 0, 20], zoom: 5 }}>
      <color attach="background" args={["#ffffff"]} />
      <ambientLight />
      <directionalLight castShadow intensity={0.6} position={[0, 0, 10]} />
      <Geometries items={items} />
      <Billboard
        follow={false}
        lockX={false}
        lockY={false}
        lockZ={false} // Lock the rotation on the z axis (default=false)
      >
        <Text
          font={"/fonts/General_Sans_Semibold_Regular.json"}
          characters="abcdefghijklmnopqrstuvwxyz0123456789!"
        >
          hello world!
        </Text>
      </Billboard>
      <OrbitControls makeDefault />
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <Lightformer
            intensity={4}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={[10, 10, 1]}
          />
          {[2, 0, 2, 0, 2, 0, 2, 0].map((x, i) => (
            <Lightformer
              key={i}
              form="circle"
              intensity={4}
              rotation={[Math.PI / 2, 0, 0]}
              position={[x, 4, i * 4]}
              scale={[4, 1, 1]}
            />
          ))}
          <Lightformer
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={[50, 2, 1]}
          />
          <Lightformer
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={[50, 2, 1]}
          />
          <Lightformer
            intensity={2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={[50, 2, 1]}
          />
        </group>
      </Environment>
    </Canvas>
  );
};
