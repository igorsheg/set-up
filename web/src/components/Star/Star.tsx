import { animated, useSpring } from "@react-spring/three";
import {
  ContactShadows,
  Environment,
  Float,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { vars } from "@styles/index.css";
import { useMemo } from "react";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Star: THREE.Mesh;
  };
  materials: {
    ["default"]: THREE.MeshStandardMaterial;
  };
};

function Model() {
  const { scene, materials } = useGLTF("/star.gltf") as GLTFResult;

  const springProps = useSpring({
    from: { opacity: 0, y: 100 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 100, friction: 20 },
  });

  useMemo(() => {
    materials["default"].color.set("orange");
    materials["default"].roughness = 0;
  }, [materials]);

  return (
    <animated.group {...springProps}>
      <primitive
        material={materials["default"]}
        castShadow
        object={scene}
        receiveShadow
      />
    </animated.group>
  );
}

export const StarScene = () => {
  return (
    <Canvas
      style={{ width: vars.sizes.s17, height: vars.sizes.s17 }}
      shadows
      camera={{ position: [0, 0, 5], fov: 40 }}
    >
      <ambientLight intensity={0.5} />
      <Float rotationIntensity={1} speed={3} rotation={[0, -Math.PI / 2, 0]}>
        <PresentationControls
          config={{ mass: 2, tension: 500 }}
          rotation={[0, 1.8, 0]}
        >
          <Model />
        </PresentationControls>
      </Float>
      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.75}
        scale={10}
        blur={2.5}
        far={4}
      />
      <Environment preset="city" />
    </Canvas>
  );
};
