# FADO — Interactive logistics world

Run `npm run dev` (PowerShell: `npm.cmd run dev`) and open **http://127.0.0.1:5173**. Node 18+ required; no installation or build step. ES modules must be served over HTTP, not opened using file://.

Pinned CDN dependencies: Three.js 0.169.0, GSAP/ScrollTrigger 3.12.5, Lenis 1.1.18. Internet access is required for these libraries and the optional Manrope font; Arial is the font fallback. Hero vehicles can be loaded from local Blender-authored GLB assets.

- Scroll or select one of eight navigation dots to travel through one continuous scene.
- Hover/click headquarters, commerce center, warehouse, ProShip hub, port or airport for destination details. Navigation offers a keyboard-accessible alternative.
- Pause motion freezes ambient vehicle/water animation. Reduced-motion preference disables the opening move and smooth wheel scrolling.
- `?debug=true` shows the camera spline, FPS, CSS viewport, device DPR, real drawing-buffer resolution, camera/target coordinates, progress, section and draw statistics.
- `?debugLayout=true` displays district `Box3` bounds, world coordinates and collision/clearance counts. Green boxes pass; red boxes require attention.
- `?quality=ultra`, `high`, `medium` or `low` overrides automatic device quality. Ultra targets 4K capture with DPR 2, crisp 2K soft shadows and 16x anisotropic filtering, then reduces render scale if sustained FPS falls below 32.
- `?renderScale=2` explicitly requests a 2x drawing buffer. Values are clamped from 0.75 to 2 to protect GPU memory.

## Source map

`src/core/Scene.js`: renderer, lighting, fog, shadows, restrained bloom and output pass.
`src/core/SurfaceTextures.js`: deterministic PBR surface detail, roughness response and device-scaled texture resolution.
`src/world/`: shared geometry/material helpers, architecture, spline roads, port/water, airport and world assembly.
`src/objects/Vehicles.js`: trucks, vans, forklift, aircraft, curve-following traffic.
`src/animation/CameraPath.js`: editable camera position/target/timing configuration with frame-independent damping.
`src/animation/ScrollController.js`: Lenis + GSAP ScrollTrigger timeline.
`src/ui/`: chapter transitions, navigation and raycast interactions.

Run `npm run check` for JS syntax and local import validation. Check rendering and console in a WebGL2 browser. High quality targets desktop 60fps; actual frame rate depends on GPU and display resolution. Contact opens a dialog linking to the official FADO website; no invented contact information or backend submission.

The scene uses a local 1K CC0 Poly Haven HDRI for outdoor image-based lighting, with an internal fallback if the file cannot load. All quality levels use native WebGL multisampling and direct rendering; this avoids the framebuffer artifacts previously seen when post-processing was combined with camera view offsets. These switches preserve the same world coordinates and storytelling.

## Blender asset pipeline

Blender source files and exported GLB models live in `assets/models`. Run
`npm run build:models` after editing the generator or Blender source. Three.js
loads the GLB into the existing logical vehicle anchors, so traffic paths,
spacing and animation remain unchanged.

The same build now exports the static FADO ecosystem campus: six distinct
supporting facilities, three shared landscape zones, a central plaza and
pedestrian connections. Core landmark coordinates and the outer road remain
unchanged; secondary campus placement is composed around the scroll journey.

The scroll story is configured in `src/animation/JourneyData.js`. Each stop
defines its progress, camera position, target, field of view and UI copy. Camera
and story navigation consume this same data, including dedicated Digital and
Technology destinations and a final aerial overview.

## Browser verification

For the optional automated checks, run `npm install`, keep the local server running, then run `npm run test:browser`. This uses an installed Chrome in headless mode. Screenshots and the result report are written to `artifacts/` (gitignored).

The latest run passed at 1440×1000 and 390×844 with no page/console errors. It checks the loading screen, destination navigation, a 3D building click on desktop, contact dialog, pause control and horizontal overflow. The final debug samples were approximately 33fps high / 36fps low in the headless test environment; this is not a device benchmark and 60fps has not been verified. Use `?quality=medium` or `?quality=low` on slower GPUs. Full runtime requires access to the pinned CDN URLs.
