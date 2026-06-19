import { useMemo } from 'react';

const SPORES = [
  { left: '8%',  delay: '0s',   duration: '14s' },
  { left: '22%', delay: '3.5s', duration: '11s' },
  { left: '42%', delay: '1.2s', duration: '13s' },
  { left: '62%', delay: '5.8s', duration: '12s' },
  { left: '78%', delay: '2.4s', duration: '15s' },
  { left: '91%', delay: '7.2s', duration: '10s' },
];

/**
 * AmbientParticles — decorative floating spore background.
 * aria-hidden so screen readers skip it entirely.
 */
export default function AmbientParticles() {
  const particles = useMemo(() => (
    <div className="ambient-container" aria-hidden="true">
      {SPORES.map((s, i) => (
        <div
          key={i}
          className="spore"
          style={{ left: s.left, animationDelay: s.delay, animationDuration: s.duration }}
        />
      ))}
    </div>
  ), []);

  return particles;
}
