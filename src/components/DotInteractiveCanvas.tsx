import React, { useEffect, useRef } from "react";

interface DotInteractiveCanvasProps {
  theme: "light" | "dark";
  className?: string;
  dotSpacing?: number;
  speedMultiplier?: number;
}

// 3D Point interface
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 3D Polyhedron structure
interface Shape3D {
  centerX: number;
  centerY: number;
  centerZ: number;
  baseRadius: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  driftVx: number;
  driftVy: number;
  vertices: Point3D[];
  edges: [number, number][];
  hue: number;
}

interface ParticleNode {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  brokenFactor: number;
}

export const DotInteractiveCanvas: React.FC<DotInteractiveCanvasProps> = ({
  theme,
  className = "",
  dotSpacing = 52,
  speedMultiplier = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, lastX: -9999, lastY: -9999, active: false };

    const isLight = theme === "light";

    // Standard 3D Polyhedron generators
    const createIcosahedron = (radius: number): { vertices: Point3D[]; edges: [number, number][] } => {
      const t = (1.0 + Math.sqrt(5.0)) / 2.0;
      const rawVerts: Point3D[] = [
        { x: -1, y: t, z: 0 }, { x: 1, y: t, z: 0 }, { x: -1, y: -t, z: 0 }, { x: 1, y: -t, z: 0 },
        { x: 0, y: -1, z: t }, { x: 0, y: 1, z: t }, { x: 0, y: -1, z: -t }, { x: 0, y: 1, z: -t },
        { x: t, y: 0, z: -1 }, { x: t, y: 0, z: 1 }, { x: -t, y: 0, z: -1 }, { x: -t, y: 0, z: 1 },
      ];

      const vertices = rawVerts.map((v) => {
        const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return {
          x: (v.x / len) * radius,
          y: (v.y / len) * radius,
          z: (v.z / len) * radius,
        };
      });

      const edges: [number, number][] = [];
      const distThresholdSq = (radius * 1.35) ** 2;

      for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          const dx = vertices[i].x - vertices[j].x;
          const dy = vertices[i].y - vertices[j].y;
          const dz = vertices[i].z - vertices[j].z;
          if (dx * dx + dy * dy + dz * dz < distThresholdSq) {
            edges.push([i, j]);
          }
        }
      }
      return { vertices, edges };
    };

    const createCube = (size: number): { vertices: Point3D[]; edges: [number, number][] } => {
      const h = size / 2;
      const vertices: Point3D[] = [
        { x: -h, y: -h, z: -h }, { x: h, y: -h, z: -h },
        { x: h, y: h, z: -h }, { x: -h, y: h, z: -h },
        { x: -h, y: -h, z: h }, { x: h, y: -h, z: h },
        { x: h, y: h, z: h }, { x: -h, y: h, z: h },
      ];
      const edges: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];
      return { vertices, edges };
    };

    const createOctahedron = (radius: number): { vertices: Point3D[]; edges: [number, number][] } => {
      const vertices: Point3D[] = [
        { x: radius, y: 0, z: 0 }, { x: -radius, y: 0, z: 0 },
        { x: 0, y: radius, z: 0 }, { x: 0, y: -radius, z: 0 },
        { x: 0, y: 0, z: radius }, { x: 0, y: 0, z: -radius },
      ];
      const edges: [number, number][] = [
        [0, 2], [2, 1], [1, 3], [3, 0],
        [0, 4], [2, 4], [1, 4], [3, 4],
        [0, 5], [2, 5], [1, 5], [3, 5],
      ];
      return { vertices, edges };
    };

    let shapes3D: Shape3D[] = [];
    let gridNodes: ParticleNode[] = [];

    const initCanvas = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || window.innerWidth;
      const height = parent?.clientHeight || window.innerHeight;

      // Ensure canvas pixel dimensions match display smoothly
      canvas.width = width;
      canvas.height = height;

      // 1. Create a controlled set of 3D floating shapes
      shapes3D = [];
      const shapeTypes = ["icosahedron", "octahedron", "cube"];
      const hues = [210, 260, 290, 175, 330, 45];
      const shapeCount = Math.max(2, Math.min(4, Math.floor(width / 360)));

      for (let s = 0; s < shapeCount; s++) {
        const type = shapeTypes[s % shapeTypes.length];
        const radius = 55 + Math.random() * 40;
        let poly;

        if (type === "icosahedron") poly = createIcosahedron(radius);
        else if (type === "cube") poly = createCube(radius * 1.1);
        else poly = createOctahedron(radius * 1.1);

        const cx = (width / (shapeCount + 1)) * (s + 1);
        const cy = height * 0.28 + (s % 2) * (height * 0.28);

        shapes3D.push({
          centerX: cx,
          centerY: cy,
          centerZ: 0,
          baseRadius: radius,
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          rotSpeedX: (0.002 + Math.random() * 0.003) * speedMultiplier,
          rotSpeedY: (0.003 + Math.random() * 0.004) * speedMultiplier,
          rotSpeedZ: (0.002 + Math.random() * 0.003) * speedMultiplier,
          driftVx: (Math.random() - 0.5) * 0.15 * speedMultiplier,
          driftVy: (Math.random() - 0.5) * 0.15 * speedMultiplier,
          vertices: poly.vertices,
          edges: poly.edges,
          hue: hues[s % hues.length],
        });
      }

      // 2. Background Grid Nodes: high efficiency spacing
      gridNodes = [];
      const spacing = Math.max(48, dotSpacing);
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const originX = i * spacing;
          const originY = j * spacing;

          gridNodes.push({
            x: originX,
            y: originY,
            originX,
            originY,
            vx: 0,
            vy: 0,
            radius: 1.3,
            hue: hues[(i + j) % hues.length],
            brokenFactor: 0,
          });
        }
      }
    };

    initCanvas();

    // IntersectionObserver to pause RAF loop completely when scrolled away
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let resizeTimer: any = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initCanvas();
      }, 150);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (mouse.lastX !== -9999) {
        mouse.vx = currentX - mouse.lastX;
        mouse.vy = currentY - mouse.lastY;
      }
      mouse.x = currentX;
      mouse.y = currentY;
      mouse.lastX = currentX;
      mouse.lastY = currentY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const rotate3D = (p: Point3D, rx: number, ry: number, rz: number): Point3D => {
      let y1 = p.y * Math.cos(rx) - p.z * Math.sin(rx);
      let z1 = p.y * Math.sin(rx) + p.z * Math.cos(rx);
      let x1 = p.x;

      let x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);
      let y2 = y1;

      let x3 = x2 * Math.cos(rz) - y2 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y2 * Math.cos(rz);
      let z3 = z2;

      return { x: x3, y: y3, z: z3 };
    };

    const render = () => {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      time += 0.008 * speedMultiplier;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const repulsionRadius = 150;
      const repulsionRadiusSq = repulsionRadius * repulsionRadius;

      // Soft Glow Halo around active cursor
      if (mouse.active) {
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          repulsionRadius
        );
        aura.addColorStop(0, isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(168, 85, 247, 0.12)");
        aura.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, repulsionRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 1. UPDATE AND RENDER 3D FLOATING SHAPES
      // -------------------------------------------------------------
      for (let s = 0; s < shapes3D.length; s++) {
        const shape = shapes3D[s];
        shape.rotX += shape.rotSpeedX;
        shape.rotY += shape.rotSpeedY;
        shape.rotZ += shape.rotSpeedZ;

        shape.centerX += shape.driftVx;
        shape.centerY += shape.driftVy;

        if (shape.centerX < 70 || shape.centerX > width - 70) shape.driftVx *= -1;
        if (shape.centerY < 70 || shape.centerY > height - 70) shape.driftVy *= -1;

        const projectedVerts: { screenX: number; screenY: number }[] = [];

        for (let v = 0; v < shape.vertices.length; v++) {
          const rot = rotate3D(shape.vertices[v], shape.rotX, shape.rotY, shape.rotZ);
          projectedVerts.push({
            screenX: shape.centerX + rot.x,
            screenY: shape.centerY + rot.y,
          });
        }

        // Draw 3D Edges batched
        ctx.beginPath();
        for (let e = 0; e < shape.edges.length; e++) {
          const [idxA, idxB] = shape.edges[e];
          const vA = projectedVerts[idxA];
          const vB = projectedVerts[idxB];
          ctx.moveTo(vA.screenX, vA.screenY);
          ctx.lineTo(vB.screenX, vB.screenY);
        }
        ctx.strokeStyle = isLight
          ? `hsla(${shape.hue}, 80%, 50%, 0.28)`
          : `hsla(${shape.hue}, 90%, 65%, 0.35)`;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Draw Vertices batched
        ctx.beginPath();
        for (let v = 0; v < projectedVerts.length; v++) {
          const vert = projectedVerts[v];
          ctx.moveTo(vert.screenX + 2.2, vert.screenY);
          ctx.arc(vert.screenX, vert.screenY, 2.2, 0, Math.PI * 2);
        }
        ctx.fillStyle = isLight
          ? `hsla(${shape.hue}, 85%, 50%, 0.75)`
          : `hsla(${shape.hue}, 90%, 70%, 0.85)`;
        ctx.fill();
      }

      // -------------------------------------------------------------
      // 2. BATCHED BACKGROUND GRID DOTS
      // -------------------------------------------------------------
      // Batch 1: Normal idle dots (single path, single fill)
      ctx.beginPath();
      const displacedNodes: ParticleNode[] = [];

      for (let i = 0; i < gridNodes.length; i++) {
        const node = gridNodes[i];

        if (mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < repulsionRadiusSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const force = ((repulsionRadius - dist) / repulsionRadius) * 2.0;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
            node.brokenFactor = Math.min(1.0, node.brokenFactor + 0.2);
            displacedNodes.push(node);
          }
        }

        // Return force
        node.vx += (node.originX - node.x) * 0.03;
        node.vy += (node.originY - node.y) * 0.03;
        node.vx *= 0.85;
        node.vy *= 0.85;

        node.x += node.vx;
        node.y += node.vy;

        if (node.brokenFactor > 0.1) {
          node.brokenFactor *= 0.92;
          if (!displacedNodes.includes(node)) displacedNodes.push(node);
        } else {
          // Normal idle dot added to batch
          ctx.moveTo(node.x + node.radius, node.y);
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        }
      }

      ctx.fillStyle = isLight ? "rgba(99, 102, 241, 0.14)" : "rgba(165, 180, 252, 0.15)";
      ctx.fill();

      // Batch 2: Displaced / active near-mouse dots
      if (displacedNodes.length > 0) {
        ctx.beginPath();
        for (let k = 0; k < displacedNodes.length; k++) {
          const d = displacedNodes[k];
          ctx.moveTo(d.x + d.radius + 1, d.y);
          ctx.arc(d.x, d.y, d.radius + 1, 0, Math.PI * 2);
        }
        ctx.fillStyle = isLight ? "rgba(99, 102, 241, 0.65)" : "rgba(6, 182, 212, 0.85)";
        ctx.fill();
      }

      mouse.vx *= 0.8;
      mouse.vy *= 0.8;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [theme, dotSpacing, speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    />
  );
};
