
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState, type CSSProperties } from "react";
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
    label: "01 / MEMORIES",
    title: "The moments worth keeping",
    message:
      "A birthday is also a pause between orbits — a little moment to look back at the memories that made this year yours.",
    position: [-2.05, 0.65, 0.15],
    color: "#efb7d3",
  },
  {
    id: 2,
    label: "02 / DREAMS",
    title: "The places still waiting",
    message:
      "There are always new skies to explore, new ideas to chase, and new destinations waiting somewhere beyond the horizon.",
    position: [1.95, 0.85, 0.1],
    color: "#c9b7ff",
  },
  {
    id: 3,
    label: "03 / PEOPLE",
    title: "The ones in her orbit",
    message:
      "Every journey becomes brighter because of the people who stay close, cheer quietly, and make the long way feel worth it.",
    position: [2.1, -0.85, 0.05],
    color: "#f3d18a",
  },
  {
    id: 4,
    label: "04 / BIRTHDAY WISH",
    title: "A wish for her next orbit",
    message:
      "May this new year bring beautiful surprises, meaningful adventures, and more reasons to look up at the stars and smile.",
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

function AnimatedFlame() {
  const flame = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!flame.current) return;
    const t = clock.getElapsedTime();
    flame.current.scale.x = 0.9 + Math.sin(t * 18) * 0.1;
    flame.current.scale.y = 1 + Math.sin(t * 15 + 1.2) * 0.12;
    flame.current.rotation.z = Math.sin(t * 14) * 0.08;
  });

  return (
    <mesh ref={flame} position={[0, 0.23, 0]}>
      <coneGeometry args={[0.07, 0.22, 20]} />
      <meshStandardMaterial
        color="#fff0b0"
        emissive="#ff9f38"
        emissiveIntensity={2.4}
        roughness={0.18}
      />
    </mesh>
  );
}

function BirthdayCandle({
  position,
  color,
  wished,
}: {
  position: [number, number, number];
  color: string;
  wished: boolean;
}) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, 0.42, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.28}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0, -0.02, 0]}>
        <torusGeometry args={[0.058, 0.008, 10, 24]} />
        <meshStandardMaterial
          color="#f4d28a"
          emissive="#f4c56b"
          emissiveIntensity={0.35}
        />
      </mesh>

      {!wished && <AnimatedFlame />}
    </group>
  );
}

function OrbitPlatform() {
  return (
    <group position={[0, -1.1, 0]} rotation={[0.03, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[1.75, 1.75, 0.12, 96]} />
        <meshStandardMaterial
          color="#1b1427"
          metalness={0.9}
          roughness={0.24}
        />
      </mesh>

      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[1.58, 1.58, 0.055, 96]} />
        <meshStandardMaterial
          color="#31213f"
          metalness={0.72}
          roughness={0.3}
          emissive="#1d1230"
          emissiveIntensity={0.45}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.035, 16, 120]} />
        <meshStandardMaterial
          color="#e6bd70"
          emissive="#d69e42"
          emissiveIntensity={1.1}
          metalness={0.86}
          roughness={0.2}
        />
      </mesh>

      {[-1.25, -0.42, 0.42, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.15, 0.82]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.05]} />
          <meshStandardMaterial
            color="#f0ca7e"
            emissive="#f0b94f"
            emissiveIntensity={1.7}
          />
        </mesh>
      ))}

      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 1.82, 0.02, Math.sin(angle) * 1.82]}
          >
            <boxGeometry args={[0.2, 0.12, 0.35]} />
            <meshStandardMaterial
              color="#5a436c"
              metalness={0.82}
              roughness={0.28}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ZeroGBirthdayCake({ wished, onWish }: { wished: boolean; onWish: () => void }) {
  return (
    <button
      className={`birthday-cake ${wished ? "birthday-cake--wished" : ""}`}
      onClick={onWish}
      aria-label={wished ? "Birthday wish made" : "Make a birthday wish"}
    >
      <span className="cake-aura" />
      <span className="cake-orbit-ring cake-orbit-ring-one" />
      <span className="cake-orbit-ring cake-orbit-ring-two" />

      <span className="cake-candles">
        {[0, 1, 2].map((candle) => (
          <span className="cake-candle" key={candle}>
            <span className="cake-flame" />
          </span>
        ))}
      </span>

      <span className="cake-top">
        <span className="cake-cream cake-cream-one" />
        <span className="cake-cream cake-cream-two" />
        <span className="cake-cream cake-cream-three" />
      </span>

      <span className="cake-body">
        <span className="cake-shine" />
        <span className="cake-name">SUSMITHA</span>
      </span>

      <span className="cake-plate" />

      {wished && (
        <span className="birthday-sparkles" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <i key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </span>
      )}
    </button>
  );
}

function SceneTwo({ onContinue }: { onContinue: () => void }) {
  const [wished, setWished] = useState(false);

  return (
    <motion.main
      className={`birthday-orbit-page ${wished ? "birthday-orbit-page--wished" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.8 }}
    >
      <div className="birthday-orbit-nebula birthday-orbit-nebula-one" />
      <div className="birthday-orbit-nebula birthday-orbit-nebula-two" />

      <div className="birthday-orbit-stars" aria-hidden="true">
        {Array.from({ length: 70 }).map((_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 43.7) % 100}%`,
              top: `${(index * 67.3) % 100}%`,
              animationDelay: `${(index % 9) * 0.45}s`,
              transform: `scale(${index % 7 === 0 ? 1.8 : index % 3 === 0 ? 1.2 : 0.7})`,
            }}
          />
        ))}
      </div>

      <header className="birthday-orbit-header">
        <div className="birthday-orbit-status">
          <span /> MISSION 02
        </div>
        <div className="birthday-orbit-title">BIRTHDAY ORBIT</div>
        <div className="birthday-orbit-id">SUS-02 / ZERO-G</div>
      </header>

      <div className="birthday-orbit-corner birthday-orbit-corner-left">
        <span>ORBITAL EVENT</span>
        <strong>CELEBRATE SUSMITHA</strong>
      </div>

      <div className="birthday-orbit-corner birthday-orbit-corner-right">
        <span>GRAVITY</span>
        <strong>ZERO-G</strong>
      </div>

      <section className="birthday-orbit-copy">
        <span className="birthday-orbit-eyebrow">✦ MISSION 02 / SPECIAL PAYLOAD ✦</span>
        <h2>
          HER
          <br />
          <em>BIRTHDAY</em>
          <br />
          ORBIT.
        </h2>
        <p>
          One more orbit around the Sun.
          <br />
          This one deserves a little celebration.
        </p>
      </section>

      <div className="birthday-cake-stage">
        <div className="birthday-orbit-path birthday-orbit-path-one" />
        <div className="birthday-orbit-path birthday-orbit-path-two" />
        <div className="birthday-orbit-center-star">✦</div>

        <ZeroGBirthdayCake wished={wished} onWish={() => setWished(true)} />

        {!wished && (
          <div className="birthday-cake-prompt">
            <span>ZERO-G BIRTHDAY PAYLOAD</span>
            <strong>TAP THE CAKE TO MAKE A WISH</strong>
          </div>
        )}
      </div>

      <div className="birthday-orbit-bottom">
        <div className="birthday-orbit-progress">
          <span className="active" />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="birthday-orbit-step">02 / 07</div>
      </div>

      <AnimatePresence>
        {wished && (
          <motion.div
            className="birthday-wish-reveal"
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>✦ BIRTHDAY PAYLOAD ACTIVATED ✦</span>
            <h3>HAPPY BIRTHDAY</h3>
            <strong>SUSMITHA</strong>
            <p>May this next orbit around the Sun be full of beautiful places, people and possibilities.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="birthday-next-mission"
        onClick={onContinue}
        disabled={!wished}
        whileHover={wished ? { y: -2 } : undefined}
        whileTap={wished ? { scale: 0.97 } : undefined}
      >
        <span>{wished ? "NEXT DESTINATION" : "MAKE A WISH FIRST"}</span>
        <strong>→</strong>
      </motion.button>

      <div className="birthday-orbit-footer">
        <span>02</span>
        <div />
        <span>BIRTHDAY ORBIT</span>
      </div>
    </motion.main>
  );
}


/* ─────────────────────────────────────────────
   SCENE 3 — SIGNAL DECODING
───────────────────────────────────────────── */

type SignalId = "origin" | "distance" | "frequency" | "unknown";

const signalContent: Record<SignalId, {
  number: string;
  label: string;
  title: string;
  text: string;
  telemetry: string;
  accent: string;
}> = {
  origin: {
    number: "01",
    label: "MEMORY / ISRO",
    title: "WE FIRST MET",
    text: "We first met at ISRO. I still like thinking about how a place surrounded by rockets, satellites and stars became part of our story.",
    telemetry: "FIRST MEET / MEMORY LOCKED",
    accent: "#f3d18a",
  },
  distance: {
    number: "02",
    label: "MEMORY / COMMUNICATION",
    title: "THE GAP",
    text: "Then came the communication gap. We didn't talk for a while, but somehow the signal found its way back.",
    telemetry: "COMMUNICATION GAP / SIGNAL RETURNED",
    accent: "#c9b7ff",
  },
  frequency: {
    number: "03",
    label: "MEMORY / CONVERSATIONS",
    title: "WE STARTED TALKING",
    text: "And then we started talking again. Slowly, the conversations became longer, easier and more natural.",
    telemetry: "CONVERSATION RESTORED / CONNECTION GROWING",
    accent: "#efb7d3",
  },
  unknown: {
    number: "04",
    label: "MEMORY / PLACES",
    title: "THE PLACES",
    text: "From visiting different places to making random little memories, those moments became some of the nicest parts of the journey. And somewhere along the way, I think we crossed paths for a reason.",
    telemetry: "MEMORIES MADE / PATHS CROSSED",
    accent: "#9fd8ff",
  },
};

function SignalSatellite({ active, decoding }: { active: boolean; decoding: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.22;
    ref.current.rotation.z = Math.sin(t * 0.65) * 0.08;
    const target = active || decoding ? 1.12 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.32, 0.42, 0.32]} />
        <meshStandardMaterial color="#d9d2df" metalness={0.78} roughness={0.22} />
      </mesh>
      <mesh position={[-0.42, 0, 0]} scale={[0.58, 0.15, 0.035]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6759a5" metalness={0.4} roughness={0.38} emissive="#30255e" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0.42, 0, 0]} scale={[0.58, 0.15, 0.035]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6759a5" metalness={0.4} roughness={0.38} emissive="#30255e" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.22]}>
        <sphereGeometry args={[0.06, 20, 20]} />
        <meshStandardMaterial color="#f3d18a" emissive="#f3d18a" emissiveIntensity={decoding ? 5 : 2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.009, 8, 64]} />
        <meshBasicMaterial color="#f3d18a" transparent opacity={active || decoding ? 0.8 : 0.34} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.45}>
        <torusGeometry args={[0.42, 0.006, 8, 64]} />
        <meshBasicMaterial color="#c9b7ff" transparent opacity={decoding ? 0.32 : 0.12} />
      </mesh>
    </group>
  );
}

function SignalNode({
  id,
  position,
  active,
  decoded,
  decoding,
  onSelect,
}: {
  id: SignalId;
  position: [number, number, number];
  active: boolean;
  decoded: boolean;
  decoding: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const item = signalContent[id];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * 1.4 + position[0]) * 0.045;
    const target = active || decoding ? 1.2 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1);
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={(event) => { event.stopPropagation(); onSelect(); }}
      onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "default"; }}
    >
      <mesh>
        <sphereGeometry args={[0.115, 24, 24]} />
        <meshStandardMaterial
          color={item.accent}
          emissive={item.accent}
          emissiveIntensity={active || decoding ? 3.8 : decoded ? 1.6 : 0.8}
        />
      </mesh>
      <mesh scale={active || decoding ? 2.4 : 1.65}>
        <sphereGeometry args={[0.19, 20, 20]} />
        <meshBasicMaterial color={item.accent} transparent opacity={active || decoding ? 0.13 : 0.045} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={active || decoding ? 1.35 : 1}>
        <torusGeometry args={[0.34, 0.006, 8, 72]} />
        <meshBasicMaterial color={item.accent} transparent opacity={active ? 0.72 : 0.22} />
      </mesh>
      <mesh rotation={[0.6, 0.4, 0.25]}>
        <torusGeometry args={[0.48, 0.004, 6, 72]} />
        <meshBasicMaterial color={item.accent} transparent opacity={decoding ? 0.6 : 0.12} />
      </mesh>
    </group>
  );
}

function RadioPulse({ from, to, active }: { from: [number, number]; to: [number, number]; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.42) % 1;
    ref.current.position.x = from[0] + (to[0] - from[0]) * t;
    ref.current.position.y = from[1] + (to[1] - from[1]) * t;
    ref.current.scale.setScalar(active ? 1.5 : 0.8);
  });

  return (
    <mesh ref={ref} visible={active}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color="#f3d18a" />
    </mesh>
  );
}

function SignalWorld({ active, decoded, decoding, onSelect }: {
  active: SignalId;
  decoded: SignalId[];
  decoding: SignalId | null;
  onSelect: (id: SignalId) => void;
}) {
  const positions: Record<SignalId, [number, number, number]> = {
    origin: [-2.7, 0.95, 0.3],
    distance: [2.65, 0.95, 0.2],
    frequency: [-2.5, -1.25, 0.35],
    unknown: [2.55, -1.15, 0.15],
  };

  const center: [number, number, number] = [0, 0, 0.5];

  return (
    <>
      <ambientLight intensity={0.24} />
      <pointLight position={[0, 2.5, 4]} intensity={9} color="#e9e0ff" />
      <pointLight position={[-4, -2, 3]} intensity={4} color="#c987bd" />
      <pointLight position={[4, -1, 2]} intensity={4} color="#8fa9ff" />
      <StarField />

      <mesh rotation={[0.25, 0.15, 0]}>
        <torusGeometry args={[2.75, 0.012, 12, 180]} />
        <meshBasicMaterial color="#d9b77b" transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[1.05, -0.35, 0.2]}>
        <torusGeometry args={[3.25, 0.008, 12, 180]} />
        <meshBasicMaterial color="#c9b7ff" transparent opacity={0.13} />
      </mesh>

      <SignalSatellite active={active !== "unknown"} decoding={!!decoding} />

      {(Object.keys(positions) as SignalId[]).map((id) => (
        <SignalNode
          key={id}
          id={id}
          position={positions[id]}
          active={active === id}
          decoded={decoded.includes(id)}
          decoding={decoding === id}
          onSelect={() => onSelect(id)}
        />
      ))}

      {(Object.keys(positions) as SignalId[]).map((id) => (
        <RadioPulse
          key={`pulse-${id}`}
          from={center.slice(0, 2) as [number, number]}
          to={positions[id].slice(0, 2) as [number, number]}
          active={active === id || decoding === id}
        />
      ))}
    </>
  );
}

function SceneThree({ onContinue }: { onContinue: () => void }) {
  const [active, setActive] = useState<SignalId>("origin");
  const [decoded, setDecoded] = useState<SignalId[]>([]);
  const [decoding, setDecoding] = useState<SignalId | null>(null);
  const [progress, setProgress] = useState(0);

  const current = signalContent[active];
  const allDecoded = decoded.length === 4;

  const decodeSignal = (id: SignalId) => {
    setActive(id);
    if (decoding || decoded.includes(id)) return;

    setDecoding(id);
    setProgress(0);
    let value = 0;
    const timer = window.setInterval(() => {
      value += 10;
      setProgress(value);
      if (value >= 100) {
        window.clearInterval(timer);
        setDecoded((previous) => previous.includes(id) ? previous : [...previous, id]);
        setDecoding(null);
      }
    }, 55);
  };

  return (
    <motion.main
      className="signal-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="signal-nebula signal-nebula-one" />
      <div className="signal-nebula signal-nebula-two" />
      <div className="signal-grid" />

      <header className="signal-header">
        <div className="signal-status"><span /> MISSION 03 / SIGNAL DECODING</div>
        <strong>SUS-03</strong>
        <div>{decoded.length.toString().padStart(2, "0")} / 04 DECODED</div>
      </header>

      <section className="signal-intro">
        <span>✦ INCOMING TRANSMISSION ✦</span>
        <h2>CHOOSE A<br /><em>SIGNAL.</em></h2>
        <p>Not every story needs a destination. Some of it arrives as a signal.</p>
      </section>

      <div className="signal-route-label signal-route-label-top">01 — 02</div>
      <div className="signal-route-label signal-route-label-bottom">03 — 04</div>

      <div className="signal-canvas">
        <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
          <SignalWorld active={active} decoded={decoded} decoding={decoding} onSelect={decodeSignal} />
        </Canvas>
      </div>

      <div className="signal-node-labels" aria-hidden="true">
        <span className="signal-label-one">01 / WE FIRST MET</span>
        <span className="signal-label-two">02 / THE GAP</span>
        <span className="signal-label-three">03 / WE STARTED TALKING</span>
        <span className="signal-label-four">04 / THE PLACES</span>
      </div>

      <motion.aside
        key={active}
        className="signal-console"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="signal-console-top">
          <span>{current.label}</span>
          <strong>{current.number}</strong>
        </div>
        <div className="signal-console-status">
          <span className={decoding === active ? "is-decoding" : decoded.includes(active) ? "is-decoded" : ""} />
          {decoding === active ? `SCANNING ${progress}%` : decoded.includes(active) ? "SIGNAL DECODED" : "SIGNAL DETECTED"}
        </div>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <div className="signal-telemetry">
          <span>{current.telemetry}</span>
          <i><b style={{ width: `${decoding === active ? progress : decoded.includes(active) ? 100 : 16}%` }} /></i>
        </div>
        <button
          type="button"
          onClick={() => decodeSignal(active)}
          disabled={!!decoding || decoded.includes(active)}
        >
          {decoding === active ? "DECODING..." : decoded.includes(active) ? "DECODED ✓" : "DECODE SIGNAL →"}
        </button>
      </motion.aside>

      <div className="signal-progress">
        {(Object.keys(signalContent) as SignalId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`${active === id ? "active" : ""} ${decoded.includes(id) ? "decoded" : ""}`}
            onClick={() => setActive(id)}
            aria-label={`Signal ${signalContent[id].number}`}
          >
            <span>{signalContent[id].number}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {allDecoded && (
          <motion.div
            className="signal-complete"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65 }}
          >
            <span>TRANSMISSION COMPLETE</span>
            <strong>ALL SIGNALS DECODED</strong>
            <p>Maybe we crossed paths for a reason.<br />Oh, and by the way... thanks for all the treats. 😌</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {allDecoded && (
          <motion.button
            type="button"
            className="signal-next-scene-button"
            onClick={onContinue}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>NEXT DESTINATION</span>
            <strong>MEMORY ARCHIVE <b>→</b></strong>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="signal-footer">
        <span>03 / 07</span>
        <div><b /><b /><b /><b /></div>
        <span>{allDecoded ? "NEXT DESTINATION / MEMORY ARCHIVE" : "SCAN / DECODE / DISCOVER"}</span>
      </div>
    </motion.main>
  );
}


/* ─────────────────────────────────────────────
   SCENE 4 — MEMORY ARCHIVE
───────────────────────────────────────────── */

type MemoryItem = {
  id: number;
  number: string;
  title: string;
  caption: string;
  image: string;
  position: string;
};

const memoryItems: MemoryItem[] = [
  { id: 1, number: "01", title: "THE FIRST FRAME", caption: "Some memories begin before you realise they will matter.", image: "/memories/memory-01.jpg", position: "memory-card-one" },
  { id: 2, number: "02", title: "A DAY TO REMEMBER", caption: "A little moment, captured and saved beyond the timeline.", image: "/memories/memory-02.jpg", position: "memory-card-two" },
  { id: 3, number: "03", title: "OUTSIDE THE ORBIT", caption: "Different places. Different skies. Still part of the same journey.", image: "/memories/memory-03.jpg", position: "memory-card-three" },
  { id: 4, number: "04", title: "THE LITTLE THINGS", caption: "The random moments somehow become the ones you remember most.", image: "/memories/memory-04.jpg", position: "memory-card-four" },
  { id: 5, number: "05", title: "ANOTHER MEMORY", caption: "A frame from somewhere along the way.", image: "/memories/memory-05.jpg", position: "memory-card-five" },
  { id: 6, number: "06", title: "STILL IN ORBIT", caption: "Some memories don't really leave. They just keep orbiting.", image: "/memories/memory-06.jpg", position: "memory-card-six" },
];

function MemoryCard({ item, active, onSelect }: { item: MemoryItem; active: boolean; onSelect: () => void }) {
  return (
    <motion.button
      type="button"
      className={`memory-card ${item.position} ${active ? "memory-card--active" : ""}`}
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      aria-label={`Open memory ${item.number}: ${item.title}`}
    >
      <span className="memory-card-glow" />
      <span className="memory-card-image">
        <img src={item.image} alt="" onError={(event) => { event.currentTarget.style.opacity = "0"; }} />
        <span className="memory-image-placeholder">ADD PHOTO</span>
      </span>
      <span className="memory-card-top"><b>{item.number}</b><i>ARCHIVE</i></span>
      <span className="memory-card-bottom">{item.title}</span>
    </motion.button>
  );
}

function MemoryArchiveWorld() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.18) * 0.025;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.12) * 0.018;
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <pointLight position={[4, 3, 5]} intensity={9} color="#d9cbff" />
      <pointLight position={[-4, -2, 3]} intensity={4} color="#e8a9c8" />
      <pointLight position={[0, 2, -4]} intensity={3} color="#f3d18a" />
      <StarField />
      <group ref={ref}>
        <mesh rotation={[0.55, 0.2, 0.1]}>
          <torusGeometry args={[2.65, 0.012, 12, 180]} />
          <meshBasicMaterial color="#d9b77b" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[1.15, -0.3, 0.2]}>
          <torusGeometry args={[3.25, 0.008, 12, 180]} />
          <meshBasicMaterial color="#c9b7ff" transparent opacity={0.18} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.5, 48, 48]} />
          <meshStandardMaterial color="#241844" emissive="#120b29" emissiveIntensity={0.9} metalness={0.25} roughness={0.5} />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial color="#c9b7ff" transparent opacity={0.07} side={THREE.BackSide} />
        </mesh>
        <Float speed={0.8} floatIntensity={0.25} rotationIntensity={0.15}>
          <Flower position={[-0.5, 0.38, 0.55]} scale={0.48} />
          <Flower position={[0.48, -0.34, 0.55]} scale={0.38} />
        </Float>
      </group>
    </>
  );
}

function SceneFour({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected ? memoryItems.find((item) => item.id === selected) : null;

  return (
    <motion.main className="memory-archive-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <div className="memory-archive-nebula memory-archive-nebula-one" />
      <div className="memory-archive-nebula memory-archive-nebula-two" />
      <div className="memory-archive-stars" aria-hidden="true">
        {Array.from({ length: 70 }).map((_, index) => (
          <span key={index} style={{ left: `${(index * 47.3) % 100}%`, top: `${(index * 71.1) % 100}%`, animationDelay: `${(index % 8) * 0.5}s` }} />
        ))}
      </div>

      <header className="memory-archive-header">
        <div><span /> MISSION 04 / MEMORY ARCHIVE</div>
        <strong>SUS-04</strong>
        <div>{selected ? "MEMORY OPEN" : "ARCHIVE ONLINE"}</div>
      </header>

      <section className="memory-archive-intro">
        <span>✦ PERSONAL ARCHIVE / VISUAL MEMORY ✦</span>
        <h2>THE MOMENTS<br /><em>WE KEEP.</em></h2>
        <p>Some moments are too good to leave behind. Tap a frame and bring it back into focus.</p>
      </section>

      <div className="memory-archive-canvas">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 42 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
          <MemoryArchiveWorld />
        </Canvas>
      </div>

      <div className="memory-orbit-line memory-orbit-line-one" />
      <div className="memory-orbit-line memory-orbit-line-two" />

      <div className="memory-card-field">
        {memoryItems.map((item) => <MemoryCard key={item.id} item={item} active={selected === item.id} onSelect={() => setSelected(item.id)} />)}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div className="memory-detail" initial={{ opacity: 0, y: 25, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15 }}>
            <button className="memory-detail-close" type="button" onClick={() => setSelected(null)}>×</button>
            <span>MEMORY {current.number} / ARCHIVED FRAME</span>
            <h3>{current.title}</h3>
            <p>{current.caption}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="memory-archive-hint">{selected ? "FRAME LOCKED / MEMORY RESTORED" : "SELECT A MEMORY FRAME"}</div>

      <motion.button className="memory-next-button" type="button" onClick={onContinue} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
        <span>OPEN THE TRANSMISSION</span><b>→</b>
      </motion.button>

      <div className="memory-archive-footer"><span>04 / 07</span><div><b className="active" /><b /><b /><b /><b /><b /><b /></div><span>MEMORY ARCHIVE / PERSONAL LOG</span></div>
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
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);
  const [launched, setLaunched] = useState(false);

  const handleLaunch = () => {
    if (launched) return;
    setLaunched(true);

    // Scene 2 will be connected after we build the zero-G birthday.
    window.setTimeout(() => {
      setScene(2);
    }, 1800);
  };

  return (
    <AnimatePresence mode="wait">
      {scene === 1 ? (
        <motion.main
          key="mission-launch"
          className={`mission-launch-page ${launched ? "mission-launch-page--launched" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8 }}
        >
          <div className="launch-space-glow launch-space-glow-one" />
          <div className="launch-space-glow launch-space-glow-two" />

          <div className="launch-stars">
            {Array.from({ length: 90 }).map((_, index) => (
              <span
                key={index}
                className="launch-star"
                style={{
                  left: `${(index * 37.17) % 100}%`,
                  top: `${(index * 61.43) % 100}%`,
                  animationDelay: `${(index % 8) * 0.45}s`,
                  transform: `scale(${index % 6 === 0 ? 1.8 : index % 3 === 0 ? 1.2 : 0.7})`,
                }}
              />
            ))}
          </div>

          <header className="launch-mission-top">
            <div className="launch-system-status">
              <span className="launch-status-dot" />
              SYSTEM ONLINE
            </div>

            <div className="launch-mission-id">
              BIRTHDAY MISSION <span>/</span> SUS-01
            </div>
          </header>

          <div className="launch-mission-grid" />

          <div className="launch-corner launch-corner-tl">
            <span>MISSION CONTROL</span>
            <strong>JAIPUR // EARTH</strong>
          </div>

          <div className="launch-corner launch-corner-tr">
            <span>DESTINATION</span>
            <strong>UNKNOWN</strong>
          </div>

          <motion.section
            className="launch-center"
            animate={
              launched
                ? {
                    scale: 0.92,
                    opacity: 0.18,
                    filter: "blur(2px)",
                  }
                : {
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                  }
            }
            transition={{ duration: 0.65 }}
          >
            <motion.div
              className="launch-eyebrow"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
            >
              ✦ A SPECIAL MISSION HAS ARRIVED ✦
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28, letterSpacing: "0.35em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.14em" }}
              transition={{
                delay: 0.5,
                duration: 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              SUSMITHA
            </motion.h1>

            <motion.div
              className="launch-orbit-mark"
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.75, duration: 1 }}
            >
              <span className="launch-orbit-core">✦</span>
              <span className="launch-orbit-ring launch-orbit-ring-one" />
              <span className="launch-orbit-ring launch-orbit-ring-two" />
            </motion.div>

            <motion.p
              className="launch-subtitle"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              A birthday journey is waiting beyond the atmosphere.
            </motion.p>

            <motion.div
              className="launch-mission-card"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.8 }}
            >
              <div>
                <span>MISSION</span>
                <strong>SUS-01</strong>
              </div>
              <div>
                <span>OBJECTIVE</span>
                <strong>CELEBRATE</strong>
              </div>
              <div>
                <span>STATUS</span>
                <strong>READY</strong>
              </div>
            </motion.div>

            <motion.button
              className="launch-command"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLaunch}
              disabled={launched}
            >
              <span className="launch-command-pulse" />
              <span>{launched ? "LAUNCHING..." : "INITIATE LAUNCH"}</span>
              <strong>↗</strong>
            </motion.button>
          </motion.section>

          <motion.div
            className="launch-vehicle"
            animate={
              launched
                ? {
                    y: "-145vh",
                    x: "8vw",
                    scale: 0.62,
                    rotate: -4,
                  }
                : {
                    y: [0, -7, 0],
                    x: 0,
                    scale: 1,
                    rotate: 0,
                  }
            }
            transition={
              launched
                ? {
                    duration: 1.65,
                    ease: [0.65, 0, 0.85, 0.2],
                  }
                : {
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            <div className="launch-vehicle-flame">
              <i />
              <i />
              <i />
            </div>

            <div className="launch-vehicle-body">
              <div className="launch-vehicle-window" />
              <div className="launch-vehicle-fin launch-vehicle-fin-left" />
              <div className="launch-vehicle-fin launch-vehicle-fin-right" />
            </div>
          </motion.div>

          <motion.div
            className="launch-countdown"
            animate={
              launched
                ? { opacity: 1, scale: 1 }
                : { opacity: 0.7, scale: 1 }
            }
          >
            <span>{launched ? "LIFTOFF" : "T-MINUS"}</span>
            <strong>{launched ? "NOW" : "00:10"}</strong>
          </motion.div>

          <div className="launch-bottom-status">
            <span>✦</span>
            <span>ALL SYSTEMS NOMINAL</span>
            <span>✦</span>
          </div>

          <AnimatePresence>
            {launched && (
              <motion.div
                className="launch-success"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55, duration: 0.7 }}
              >
                <span>MISSION LAUNCH</span>
                <h2>LIFTOFF</h2>
                <p>Next destination: a birthday in zero gravity.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      ) : scene === 2 ? (
        <SceneTwo
          key="scene-two"
          onContinue={() => setScene(3)}
        />
      ) : scene === 3 ? (
        <SceneThree key="scene-three" onContinue={() => setScene(4)} />
      ) : (
        <SceneFour key="scene-four" onContinue={() => {}} />
      )}
    </AnimatePresence>
  );
}
