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
      high: { dpr: 1.65, shadow: 2048, particles: 100, post: true },
      medium: { dpr: 1.4, shadow: 1024, particles: 55, post: true },
      low: { dpr: 1.2, shadow: 512, particles: 24, post: false },
    }[name],
  };
}
