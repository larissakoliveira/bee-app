import { useState, useRef, useEffect } from 'react';
import { MAX_BEES, BEE_THROTTLE_MS } from '../constants/config';

interface BeePosition {
  x: number;
  y: number;
}

/** Mouse trail in viewport coordinates (matches `position: fixed`). */
export function useBeeMovement() {
  const [bees, setBees] = useState<BeePosition[]>([]);
  const beesRef = useRef<BeePosition[]>([]);
  const lastFireRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const updateBeePosition = (clientX: number, clientY: number) => {
      const newBee = { x: clientX, y: clientY };

      beesRef.current = [...beesRef.current, newBee];
      if (beesRef.current.length > MAX_BEES) {
        beesRef.current.shift();
      }
      setBees([...beesRef.current]);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now();
      if (now - lastFireRef.current < BEE_THROTTLE_MS) {
        return;
      }
      lastFireRef.current = now;
      updateBeePosition(event.clientX, event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return bees;
}
