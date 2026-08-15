import * as THREE from "three";

export function Renderer() {
  const canvas = document.querySelector("canvas.game");
  if (!canvas) throw new Error("Canvas not found");

  // ensure canvas will scale responsively in DOM
  (canvas as HTMLCanvasElement).style.width = "100%";
  (canvas as HTMLCanvasElement).style.height = "100%";
  (canvas as HTMLCanvasElement).style.display = "block";

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas,
  });
  
  const parent = canvas.parentElement;
  if (!parent) throw new Error("Canvas parent not found");

  const resize = () => {
    // fallback to sensible values if parent reports 0
    const parentRect = parent.getBoundingClientRect();
    const width =
      parent.clientWidth || Math.round(parentRect.width) || window.innerWidth;
    const height =
      parent.clientHeight ||
      Math.round(parentRect.height) ||
      Math.min(Math.round(window.innerHeight * 0.7), 800);

    // cap pixel ratio to avoid extremely large buffers on mobile
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
  };

  // initial resize
  resize();
  window.addEventListener("resize", resize, { passive: true });

  renderer.shadowMap.enabled = true;

  const dispose = () => {
    window.removeEventListener("resize", resize);

    // stop any ongoing loop from the outside too (safe)
    renderer.setAnimationLoop(null);

    renderer.dispose();
  };

  return {renderer, dispose};
}