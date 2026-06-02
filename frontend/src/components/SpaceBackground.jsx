import { useEffect, useRef } from 'react';

/**
 * SpaceBackground
 * ─────────────────────────────────────────────────────────────────────
 * Renders a fixed deep-space backdrop with:
 *  • 3 procedural star layers (different densities / sizes)
 *  • A nebula cloud layer
 *  • A galactic core glow
 *  • Shooting stars (CSS keyframe)
 *  • Scroll-driven slow rotation — each star layer rotates at a
 *    different speed ratio so they parallax against each other,
 *    creating a 3-D "flying through space" sensation as you scroll.
 */
export default function SpaceBackground() {
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const layer3Ref = useRef(null);
  const nebulaRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    // Scroll-driven rotation
    // Each layer gets a different multiplier so they rotate independently
    const SPEEDS = { l1: 0.012, l2: 0.008, l3: 0.005, nebula: 0.004 };

    let scrollY    = window.scrollY;
    let targetY    = scrollY;
    let currentRot = { l1: 0, l2: 0, l3: 0, nebula: 0 };

    const onScroll = () => {
      targetY = window.scrollY;
    };

    const animate = () => {
      // Smooth lerp so the rotation eases rather than snapping
      scrollY += (targetY - scrollY) * 0.06;

      currentRot.l1     = scrollY * SPEEDS.l1;
      currentRot.l2     = scrollY * SPEEDS.l2;
      currentRot.l3     = scrollY * SPEEDS.l3;
      currentRot.nebula = scrollY * SPEEDS.nebula;

      if (layer1Ref.current)
        layer1Ref.current.style.transform = `rotate(${currentRot.l1}deg)`;
      if (layer2Ref.current)
        layer2Ref.current.style.transform = `rotate(${-currentRot.l2}deg)`;  // counter-rotate
      if (layer3Ref.current)
        layer3Ref.current.style.transform = `rotate(${currentRot.l3}deg)`;
      if (nebulaRef.current)
        nebulaRef.current.style.transform = `rotate(${-currentRot.nebula}deg)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div id="space-bg" aria-hidden="true">

      {/* ── Star layer 1 — tiny distant stars, slow clockwise ── */}
      <div ref={layer1Ref} className="star-layer star-layer-1" />

      {/* ── Star layer 2 — medium stars, counter-clockwise ── */}
      <div ref={layer2Ref} className="star-layer star-layer-2" />

      {/* ── Star layer 3 — large bright stars, slow clockwise ── */}
      <div ref={layer3Ref} className="star-layer star-layer-3" />

      {/* ── Nebula clouds ── */}
      <div ref={nebulaRef} className="nebula-layer" />

      {/* ── Galactic core glow ── */}
      <div className="galactic-core" />

      {/* ── Shooting stars ── */}
      <div className="shooting-star" />
      <div className="shooting-star" />
      <div className="shooting-star" />
      <div className="shooting-star" />
    </div>
  );
}
