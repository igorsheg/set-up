import { animated, useSpring } from "@react-spring/three";
import {
  AccumulativeShadows,
  ContactShadows,
  Environment,
  Float,
  PresentationControls,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import { Canvas, GroupProps } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { CanvasTexture, RepeatWrapping, UVMapping } from "three";
import { FlakesTexture } from "three-stdlib";

function Model(_props: GroupProps) {
  // @ts-ignore - missing types
  const { scene, materials } = useGLTF("/star.gltf");

  const springProps = useSpring({
    from: { opacity: 0, position: [0, -0.2, 0] },
    to: { opacity: 1, position: [0, 0, 0] },
    config: { mass: 1, tension: 200, friction: 20 },
  });

  useLayoutEffect(() => {
    console.log("materials", materials);
    materials["Color - Red"].color.set("orange");
    materials["Color - Red"].roughness = 0;
    materials["Color - Red"].normalMap = new CanvasTexture(
      // @ts-ignore - missing types
      new FlakesTexture(),
      UVMapping,
      RepeatWrapping,
      RepeatWrapping,
    );
    materials["Color - Red"].normalMap.repeat.set(40, 40);
    materials["Color - Red"].normalScale.set(0.1, 0.1);
  });

  return (
    // @ts-ignore - missing types
    <animated.group {...springProps}>
      <primitive
        material={materials["Color - Red"]}
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
      style={{ width: "300px", height: "300px" }}
      shadows
      camera={{ position: [0, 0, 5], fov: 40 }}
    >
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        shadow-mapSize={2048}
        castShadow
      />
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
      <AccumulativeShadows
        temporal
        frames={100}
        color="orange"
        colorBlend={2}
        toneMapped={true}
        alphaTest={0.9}
        opacity={2}
        scale={12}
      >
        <RandomizedLight
          amount={8}
          radius={4}
          ambient={0.5}
          intensity={1}
          position={[5, 5, -10]}
          bias={0.001}
        />
      </AccumulativeShadows>
      <Environment preset="city" />
    </Canvas>
  );
};
