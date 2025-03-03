import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

const Model = () => {
  const [model, setModel] = useState(null);
  const [mixer, setMixer] = useState(null);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load("model2.fbx", (fbx) => {
      fbx.scale.set(0.045, 0.045, 0.045);
      fbx.position.set(0, -1.8, 0);
      fbx.rotation.y = -Math.PI / 4;

      let newMixer = new THREE.AnimationMixer(fbx);
      if (fbx.animations.length > 0) {
        const action = newMixer.clipAction(fbx.animations[0]);
        action.play();
      }

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      setModel(fbx);
      setMixer(newMixer);
    });

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, []);

  useEffect(() => {
    if (!mixer) return;

    const clock = new THREE.Clock();
    const animate = () => {
      mixer.update(clock.getDelta());
      requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animate);
  }, [mixer]);

  return model ? <primitive object={model} /> : null;
};

const Loader = () => {
  const [loadingText, setLoadingText] = useState("");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Delay before showing the "Loading" text
    const delayTimeout = setTimeout(() => {
      setShowText(true);
      setLoadingText("Loading"); // Show "Loading" first

      const interval = setInterval(() => {
        setLoadingText((prev) =>
          prev.length < 10 ? prev + "." : "Loading" // Add dots up to "Loading..."
        );
      }, 500); // Updates every 500ms

      return () => clearInterval(interval);
    }, 400); // 400ms delay before showing text

    return () => clearTimeout(delayTimeout);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#FFB7C3",
      }}
    >
      {showText && (
        <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "20px" }}>
          {loadingText}
        </h2>
      )}
      <div style={{ width: "100%", height: "500px", marginTop:"160px"}}>
        <Canvas camera={{ position: [0, 2, 7], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default Loader;
