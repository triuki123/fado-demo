export function getQuality() {
  const forced = new URLSearchParams(location.search).get("quality");
  const name = ["high", "medium", "low"].includes(forced)
    ? forced
    : innerWidth < 600
      ? "low"
      : innerWidth < 1100 || navigator.hardwareConcurrency < 6
        ? "medium"
        : "high";
  return {
    name,
    ...{
      high: {
        dpr: 1.25,
        shadow: 1536,
        particles: 100,
        post: false,
        ao: false,
        aa: false,
        textureSize: 512,
        motionScale: 0.72,
      },
      medium: {
        dpr: 1.35,
        shadow: 1024,
        particles: 55,
        post: false,
        ao: false,
        aa: false,
        textureSize: 256,
        motionScale: 0.8,
      },
      low: {
        dpr: 1,
        shadow: 512,
        particles: 24,
        post: false,
        ao: false,
        aa: false,
        textureSize: 128,
        motionScale: 1,
      },
    }[name],
  };
}
