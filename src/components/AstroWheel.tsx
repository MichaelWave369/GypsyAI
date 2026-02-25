import { PlanetPosition } from '@/types';

export function AstroWheel({ placements }: { placements: PlanetPosition[] }) {
  const radius = 140;
  const center = 160;
  return (
    <svg width="320" height="320" className="panel">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#d8b25a" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="#666"
          />
        );
      })}
      {placements.map((p) => {
        const angle = (p.longitude - 90) * (Math.PI / 180);
        const x = center + (radius - 20) * Math.cos(angle);
        const y = center + (radius - 20) * Math.sin(angle);
        return (
          <text key={p.body} x={x} y={y} fill="#f4d58d" fontSize="10" textAnchor="middle">
            {p.body.slice(0, 2)}
          </text>
        );
      })}
    </svg>
  );
}
