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
        shadow: 1024,
        particles: 75,
        post: true,
        ao: false,
        aa: true,
        textureSize: 512,
        motionScale: 0.75,
      },
      medium: {
        dpr: 1.15,
        shadow: 1024,
        particles: 45,
        post: true,
        ao: false,
        aa: true,
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
