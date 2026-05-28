/** Subtle floating particles for the empty chat hero */
export function ParticlesBackground() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 11) % 100}%`,
    top: `${(i * 23 + 7) % 100}%`,
    size: 2 + (i % 3),
    delay: `${(i % 8) * 0.7}s`,
    duration: `${14 + (i % 6) * 2}s`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white/5 animate-[float_var(--dur)_ease-in-out_infinite]"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              "--dur": p.duration,
            } as React.CSSProperties
          }
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(8px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
