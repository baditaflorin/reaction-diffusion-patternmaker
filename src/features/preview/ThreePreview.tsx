import { useEffect, useRef } from "react";

export function ThreePreview({
  sourceCanvas,
}: {
  sourceCanvas: HTMLCanvasElement | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const renderCanvas = canvas;

    let disposed = false;
    let cleanup = () => undefined;

    async function boot() {
      const THREE = await import("three");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: renderCanvas,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x101112, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
      camera.position.set(0, 0.2, 4.2);

      const fallback = document.createElement("canvas");
      fallback.width = 2;
      fallback.height = 2;
      const fallbackContext = fallback.getContext("2d");
      if (fallbackContext) {
        fallbackContext.fillStyle = "#101112";
        fallbackContext.fillRect(0, 0, 2, 2);
        fallbackContext.fillStyle = "#60d8d3";
        fallbackContext.fillRect(0, 0, 1, 1);
        fallbackContext.fillStyle = "#f8c14a";
        fallbackContext.fillRect(1, 1, 1, 1);
      }

      const texture = new THREE.CanvasTexture(sourceCanvas || fallback);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.8, 1.8);
      texture.colorSpace = THREE.SRGBColorSpace;

      const geometry = new THREE.CylinderGeometry(1.18, 1.18, 1.7, 96, 8, true);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture,
        displacementMap: texture,
        displacementScale: 0.08,
        metalness: 0.08,
        roughness: 0.72,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -0.22;
      scene.add(mesh);

      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(2.3, 3.1, 4);
      scene.add(key);
      scene.add(new THREE.AmbientLight(0x7aa7a4, 1.2));

      const resize = () => {
        const parent = renderCanvas.parentElement;
        const width = Math.max(220, parent?.clientWidth ?? 260);
        const height = Math.max(180, parent?.clientHeight ?? 220);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const observer = new ResizeObserver(resize);
      if (renderCanvas.parentElement)
        observer.observe(renderCanvas.parentElement);
      resize();

      renderer.setAnimationLoop(() => {
        if (sourceCanvas && texture.image !== sourceCanvas) {
          texture.image = sourceCanvas;
        }
        texture.needsUpdate = true;
        mesh.rotation.y += 0.006;
        renderer.render(scene, camera);
      });

      cleanup = () => {
        observer.disconnect();
        renderer.setAnimationLoop(null);
        texture.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }

    void boot();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [sourceCanvas]);

  return (
    <canvas
      aria-label="Three.js fabric and material preview"
      className="preview-canvas"
      ref={canvasRef}
    />
  );
}
