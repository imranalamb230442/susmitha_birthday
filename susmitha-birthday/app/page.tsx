
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   STAR FIELD
───────────────────────────────────────────── */

function StarField() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 850;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 7 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] =
        radius * Math.cos(phi);

      sizes[i] = Math.random() * 2.2 + 0.4;
    }

    return { positions, sizes };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008;
      pointsRef.current.rotation.x += delta * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.035}
        color="#f4efff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

/* ─────────────────────────────────────────────
   PLANET
───────────────────────────────────────────── */

function Planet() {
  const planet = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (planet.current) {
      planet.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={planet}>
      {/* atmosphere glow */}
      <mesh scale={1.16}>
        <sphereGeometry args={[1.45, 64, 64]} />
        <meshBasicMaterial
          color="#b89aff"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
        />
      </mesh>

      {/* main planet */}
      <mesh>
        <sphereGeometry args={[1.45, 64, 64]} />
        <meshStandardMaterial
          color="#30235f"
          roughness={0.68}
          metalness={0.12}
          emissive="#160e36"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* illuminated hemisphere */}
      <mesh scale={1.01}>
        <sphereGeometry args={[1.45, 64, 64]} />
        <meshStandardMaterial
          color="#5c4291"
          transparent
          opacity={0.42}
          roughness={0.8}
        />
      </mesh>

      {/* continent-like decorative shapes */}
      <mesh position={[-0.55, 0.42, 1.25]} scale={[0.42, 0.18, 0.04]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color="#8b6cc4" transparent opacity={0.3} />
      </mesh>

      <mesh position={[0.48, -0.32, 1.29]} scale={[0.3, 0.14, 0.04]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color="#c093cf" transparent opacity={0.22} />
      </mesh>

      {/* atmosphere edge */}
      <mesh scale={1.08}>
        <sphereGeometry args={[1.45, 64, 64]} />
        <meshBasicMaterial
          color="#f3c6dc"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   FLOWER
───────────────────────────────────────────── */

function Flower({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const flower = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (flower.current) {
      flower.current.rotation.z += delta * 0.08;
      flower.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group
      ref={flower}
      position={position}
      scale={scale}
    >
      {Array.from({ length: 6 }).map((_, index) => {
        const angle = (index / 6) * Math.PI * 2;

        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * 0.18,
              Math.sin(angle) * 0.18,
              0,
            ]}
            rotation={[0, 0, angle]}
          >
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#efb8d4" : "#cbb5ff"}
              emissive={
                index % 2 === 0 ? "#b45d88" : "#7760bb"
              }
              emissiveIntensity={0.28}
              roughness={0.4}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 0, 0.09]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial
          color="#f6d98b"
          emissive="#f6d98b"
          emissiveIntensity={1.2}
        />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   ORBITING BODY
───────────────────────────────────────────── */

function OrbitingBody({
  radius,
  speed,
  offset,
  size,
}: {
  radius: number;
  speed: number;
  offset: number;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime() * speed + offset;

    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 1.7) * 0.35;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshStandardMaterial
        color="#d9a9c7"
        emissive="#9d638d"
        emissiveIntensity={0.45}
        roughness={0.35}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   ORBIT RING
───────────────────────────────────────────── */

function OrbitRing({
  rotation,
  radius,
}: {
  rotation: [number, number, number];
  radius: number;
}) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry
        args={[radius, 0.012, 16, 180]}
      />
      <meshBasicMaterial
        color="#d9b77b"
        transparent
        opacity={0.58}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   3D WORLD
───────────────────────────────────────────── */

function SpaceWorld() {
  return (
    <>
      <ambientLight intensity={0.22} />

      <pointLight
        position={[4, 4, 6]}
        intensity={10}
        color="#e5d8ff"
      />

      <pointLight
        position={[-4, -2, 3]}
        intensity={5}
        color="#d989b4"
      />

      <pointLight
        position={[0, 4, -3]}
        intensity={4}
        color="#f6d98b"
      />

      <StarField />

      <Float
        speed={0.55}
        rotationIntensity={0.12}
        floatIntensity={0.28}
      >
        <Planet />

        <Flower
          position={[-0.78, 0.48, 1.22]}
          scale={0.8}
        />

        <Flower
          position={[0.65, -0.55, 1.25]}
          scale={0.63}
        />

        <Flower
          position={[0.1, 0.95, 1.0]}
          scale={0.42}
        />

        <OrbitRing
          rotation={[0.35, 0.15, 0]}
          radius={2}
        />

        <OrbitRing
          rotation={[1.05, 0.3, 0.4]}
          radius={2.18}
        />

        <OrbitRing
          rotation={[0.5, 1.15, 0.15]}
          radius={2.38}
        />

        <OrbitingBody
          radius={2}
          speed={0.38}
          offset={0}
          size={0.09}
        />

        <OrbitingBody
          radius={2.18}
          speed={-0.25}
          offset={2}
          size={0.065}
        />

        <OrbitingBody
          radius={2.38}
          speed={0.2}
          offset={4}
          size={0.075}
        />
      </Float>
    </>
  );
}


/* ─────────────────────────────────────────────
   SCENE 2 — HER ORBIT
───────────────────────────────────────────── */

type OrbitNodeData = {
  id: number;
  label: string;
  title: string;
  message: string;
  position: [number, number, number];
  color: string;
};

const orbitNodes: OrbitNodeData[] = [
  {
    id: 1,
    label: "01 / MEMORY",
    title: "The moments that stay",
    message:
      "Some moments arrive quietly, then become the memories we carry with us.",
    position: [-2.05, 0.65, 0.15],
    color: "#efb7d3",
  },
  {
    id: 2,
    label: "02 / DREAM",
    title: "Beyond the atmosphere",
    message:
      "For someone who chose aerospace, the sky was never really the limit.",
    position: [1.95, 0.85, 0.1],
    color: "#c9b7ff",
  },
  {
    id: 3,
    label: "03 / WISH",
    title: "A wish for the journey",
    message:
      "May every orbit you enter lead you somewhere beautiful, unexpected and yours.",
    position: [2.1, -0.85, 0.05],
    color: "#f3d18a",
  },
  {
    id: 4,
    label: "04 / YOU",
    title: "The brightest point",
    message:
      "Every little universe needs a star at its center. This one happens to be you.",
    position: [-1.9, -0.9, 0.2],
    color: "#e8c4ff",
  },
];

function OrbitNode({
  node,
  selected,
  onSelect,
}: {
  node: OrbitNodeData;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.5 + node.id) * 0.07;
    const target = selected ? 1.28 : pulse;

    ref.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      0.08,
    );
  });

  return (
    <group
      ref={ref}
      position={node.position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <mesh>
        <sphereGeometry args={[0.115, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={selected ? 1.5 : 0.7}
          roughness={0.25}
        />
      </mesh>

      <mesh scale={2.8}>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={selected ? 0.16 : 0.07}
        />
      </mesh>

      <mesh rotation={[0.4, 0.7, 0]}>
        <torusGeometry args={[0.19, 0.008, 8, 48]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={selected ? 0.8 : 0.35}
        />
      </mesh>
    </group>
  );
}

function OrbitWorld({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (id: number) => void;
}) {
  const system = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (system.current) {
      system.current.rotation.y += delta * 0.035;
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} />

      <pointLight position={[4, 4, 5]} intensity={8} color="#d9cbff" />
      <pointLight position={[-4, -2, 3]} intensity={4} color="#e8a9c8" />
      <pointLight position={[0, 3, -4]} intensity={3} color="#f3d18a" />

      <StarField />

      <group ref={system}>
        <mesh>
          <sphereGeometry args={[0.92, 64, 64]} />
          <meshStandardMaterial
            color="#392768"
            emissive="#180d3a"
            emissiveIntensity={0.55}
            roughness={0.65}
          />
        </mesh>

        <mesh scale={1.09}>
          <sphereGeometry args={[0.92, 64, 64]} />
          <meshBasicMaterial
            color="#c5adff"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2.4, 0.1, 0]}>
          <torusGeometry args={[1.35, 0.012, 16, 180]} />
          <meshBasicMaterial
            color="#f3d18a"
            transparent
            opacity={0.5}
          />
        </mesh>

        <mesh rotation={[0.8, 0.6, 0.3]}>
          <torusGeometry args={[1.75, 0.008, 16, 180]} />
          <meshBasicMaterial
            color="#c9b7ff"
            transparent
            opacity={0.32}
          />
        </mesh>

        <mesh rotation={[1.3, 0.1, 0.9]}>
          <torusGeometry args={[2.15, 0.007, 16, 180]} />
          <meshBasicMaterial
            color="#efb7d3"
            transparent
            opacity={0.24}
          />
        </mesh>

        <Float speed={1} floatIntensity={0.18} rotationIntensity={0.15}>
          <Flower position={[-0.38, 0.48, 0.75]} scale={0.55} />
          <Flower position={[0.48, -0.42, 0.76]} scale={0.42} />
        </Float>

        {orbitNodes.map((node) => (
          <OrbitNode
            key={node.id}
            node={node}
            selected={selected === node.id}
            onSelect={onSelect}
          />
        ))}
      </group>
    </>
  );
}

function SceneTwo({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const selectedNode =
    orbitNodes.find((node) => node.id === selected) ?? null;

  return (
    <motion.main
      className="orbit-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="orbit-nebula orbit-nebula-one" />
      <div className="orbit-nebula orbit-nebula-two" />

      <header className="orbit-header">
        <div className="orbit-status">
          <span />
          MISSION 02
        </div>

        <div className="orbit-header-title">
          HER ORBIT
        </div>

        <div className="orbit-counter">
          {selected ? `POINT 0${selected}` : "4 POINTS"}
        </div>
      </header>

      <div className="orbit-copy">
        <span className="orbit-eyebrow">
          ✦ ENTER HER LITTLE UNIVERSE
        </span>

        <h2>
          EVERYTHING
          <br />
          <em>ORBITING</em>
          <br />
          AROUND HER.
        </h2>

        <p>
          Four little points.
          <br />
          Four little pieces of a journey.
        </p>
      </div>

      <div className="orbit-canvas">
        <Canvas
          camera={{
            position: [0, 0, 7],
            fov: 42,
          }}
          dpr={[1, 1.8]}
          gl={{
            antialias: true,
            alpha: true,
          }}
        >
          <OrbitWorld
            selected={selected}
            onSelect={setSelected}
          />
        </Canvas>
      </div>

      <div className="orbit-instruction">
        <span className="instruction-dot" />
        TAP A GLOWING POINT TO EXPLORE
      </div>

      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            className="orbit-card"
            initial={{
              opacity: 0,
              x: 25,
              y: "-50%",
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: "-50%",
            }}
            exit={{
              opacity: 0,
              x: 25,
              y: "-50%",
            }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              className="orbit-card-number"
              style={{ color: selectedNode.color }}
            >
              {selectedNode.label}
            </div>

            <h3>{selectedNode.title}</h3>

            <p>{selectedNode.message}</p>

            <button
              className="close-orbit-card"
              onClick={() => setSelected(null)}
            >
              CLOSE ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="orbit-progress">
        {orbitNodes.map((node) => (
          <button
            key={node.id}
            className={
              selected === node.id
                ? "progress-dot active"
                : "progress-dot"
            }
            onClick={() => setSelected(node.id)}
            aria-label={`Explore point ${node.id}`}
          />
        ))}
      </div>

      <motion.button
        className="continue-mission"
        onClick={onContinue}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <span>CONTINUE MISSION</span>
        <strong>→</strong>
      </motion.button>

      <div className="orbit-footer">
        <span>02</span>
        <div />
        <span>HER ORBIT</span>
      </div>
    </motion.main>
  );
}

/* ─────────────────────────────────────────────
   DECORATIVE STARS
───────────────────────────────────────────── */

const decorativeStars = Array.from(
  { length: 55 },
  (_, index) => ({
    id: index,
    left: `${(index * 41.73) % 100}%`,
    top: `${(index * 67.19) % 100}%`,
    delay: `${(index % 7) * 0.7}s`,
    size: index % 6 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
  })
);

/* ─────────────────────────────────────────────
   HOME
───────────────────────────────────────────── */

export default function Home() {
  const [scene, setScene] = useState<1 | 2>(1);

  return (
    <AnimatePresence mode="wait">
      {scene === 1 ? (
        <motion.main
          key="scene-one"
          className="launch-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
      <div className="nebula nebula-one" />
      <div className="nebula nebula-two" />
      <div className="nebula nebula-three" />

      <div className="stars-layer">
        {decorativeStars.map((star) => (
          <span
            key={star.id}
            className="decorative-star"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* TOP NAV */}
      <header className="mission-header">
        <div className="system-status">
          <span className="status-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>

        <div className="mission-title">
          MISSION 01 <span>/</span> HER ORBIT
        </div>
      </header>

      {/* SIDE MISSION NAV */}
      <aside className="mission-nav">
        <div className="mission-nav-line" />

        <div className="mission-step active">
          <span>01</span>
          <div />
          <p>THE LAUNCH</p>
        </div>

        <div className="mission-step">
          <span>02</span>
          <div />
          <p>HER ORBIT</p>
        </div>

        <div className="mission-step">
          <span>03</span>
          <div />
          <p>CONSTELLATION</p>
        </div>

        <div className="mission-step">
          <span>04</span>
          <div />
          <p>THE DREAM</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="launch-content">
        <motion.div
          className="transmission-label"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="label-star">✦</span>
          A SPECIAL TRANSMISSION
          <span className="label-star">✦</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          SUSMITHA
        </motion.h1>

        <motion.div
          className="title-orbit"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        <motion.p
          className="subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45 }}
        >
          A little journey beyond the atmosphere
          <br />
          <span>begins here.</span>
        </motion.p>

        {/* 3D PLANET */}
        <motion.div
          className="planet-stage"
          initial={{
            opacity: 0,
            scale: 0.75,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 1.5,
            delay: 0.25,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Canvas
            camera={{
              position: [0, 0, 6.8],
              fov: 40,
            }}
            dpr={[1, 1.8]}
            gl={{
              antialias: true,
              alpha: true,
            }}
          >
            <SpaceWorld />
          </Canvas>
        </motion.div>

        <motion.button
          className="launch-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 1,
          }}
          onClick={() => setScene(2)}
          whileHover={{
            scale: 1.035,
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          <span className="button-label">
            BEGIN THE JOURNEY
          </span>

          <span className="button-arrow">
            →
          </span>
        </motion.button>
      </section>

      {/* RIGHT QUOTE */}
      <div className="side-quote">
        <span className="quote-line" />

        <p>
          SOME PEOPLE
          <br />
          MAKE THE WORLD
          <br />
          <strong>BRIGHTER</strong>, JUST
          <br />
          BY BEING IN IT.
        </p>

        <span className="quote-star">✦</span>
      </div>

      {/* BOTTOM LEFT */}
      <div className="experience-label">
        <div className="experience-icon">
          <span>✧</span>
        </div>

        <div>
          <strong>A COSMIC EXPERIENCE</strong>
          <small>FOR SOMEONE SPECIAL</small>
        </div>
      </div>

      {/* BOTTOM CENTER */}
      <div className="scroll-indicator">
        <div className="scroll-icon">↓</div>
        <span>EXPLORE</span>
      </div>

      {/* BOTTOM RIGHT */}
      <div className="sound-indicator">
        <div className="sound-icon">♫</div>
        <span>SOUND OFF</span>
        <div className="sound-line" />
      </div>

      {/* DECORATIVE FLOATING SYMBOLS */}
      <div className="floating-symbol symbol-one">✦</div>
      <div className="floating-symbol symbol-two">✧</div>
      <div className="floating-symbol symbol-three">✦</div>
      <div className="floating-symbol symbol-four">·</div>

      <div className="horizon-glow" />
        </motion.main>
      ) : (
        <SceneTwo
          key="scene-two"
          onContinue={() => setScene(1)}
        />
      )}
    </AnimatePresence>
  );
}

