import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function createScrollController(reduced) {
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: !reduced,
    syncTouch: true,
    syncTouchLerp: 0.08,
    touchInertiaMultiplier: 1.25,
    touchMultiplier: 1.5,
    wheelMultiplier: 0.95,
  });
  const state = { progress: 0 };
  lenis.on("scroll", ScrollTrigger.update);
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#scroll-space",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  timeline.to(state, { progress: 1, ease: "none" });
  lenis.stop();
  return {
    state,
    update: (time) => lenis.raf(time),
    start: () => {
      lenis.start();
      ScrollTrigger.refresh();
    },
    go: (p) =>
      lenis.scrollTo(
        p *
          Math.max(
            0,
            document.querySelector("#scroll-space").offsetHeight - innerHeight,
          ),
        { duration: reduced ? 0.1 : 2 },
      ),
    stop: () => lenis.stop(),
    resume: () => lenis.start(),
  };
}
