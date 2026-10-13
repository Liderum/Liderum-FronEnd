import type { CSSProperties } from 'react';

// Cada traço recebe um atraso próprio (--d): a planta se desenha na ordem em que uma obra acontece —
// terreno, estrutura, prédio, grua, cotas. pathLength=1 deixa o dash independente do tamanho real do traço.
const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

const WINDOWS: Array<[number, number, number]> = [];
for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 4; col++) {
    WINDOWS.push([138 + col * 40, 236 + row * 40, 3.2 + ((row * 4 + col) % 7) * 0.45]);
  }
}

export function Blueprint() {
  return (
    <div className="pl-plan" aria-hidden="true">
      <svg viewBox="0 0 520 560" fill="none">
        {/* terreno */}
        <path className="pl-draw" pathLength={1} style={d(0.3)} d="M10 500 H510" />
        <path className="pl-draw thin" pathLength={1} style={d(0.5)} d="M10 508 H510" />

        {/* prédio acabado */}
        <path className="pl-draw" pathLength={1} style={d(0.7)} d="M120 500 V220 H300 V500" />
        <path className="pl-draw" pathLength={1} style={d(1.1)} d="M112 220 H308" />
        {[260, 300, 340, 380, 420, 460].map((y, i) => (
          <path key={y} className="pl-draw thin" pathLength={1} style={d(1.2 + i * 0.12)} d={`M120 ${y} H300`} />
        ))}
        {WINDOWS.map(([x, y, delay]) => (
          <rect key={`${x}-${y}`} className="pl-win" style={d(delay)} x={x} y={y} width="20" height="22" />
        ))}
        <path className="pl-draw" pathLength={1} style={d(2)} d="M190 500 V470 H230 V500" />

        {/* estrutura em construção */}
        {[330, 370, 410, 450].map((x, i) => (
          <path key={x} className="pl-draw" pathLength={1} style={d(1.4 + i * 0.18)} d={`M${x} 500 V${360 - i * 0}`} />
        ))}
        {[460, 410, 360].map((y, i) => (
          <path key={y} className="pl-draw" pathLength={1} style={d(2 + i * 0.2)} d={`M324 ${y} H456`} />
        ))}
        <path className="pl-draw dash" style={d(2.8)} d="M330 460 L370 410 M370 460 L410 410 M410 460 L450 410 M330 410 L370 360 M370 410 L410 360 M410 410 L450 360" />

        {/* grua */}
        <path className="pl-draw" pathLength={1} style={d(1.6)} d="M470 500 V118" />
        <path className="pl-draw" pathLength={1} style={d(1.8)} d="M458 500 V118 M482 500 V118" />
        <path className="pl-draw dash" style={d(3)} d="M458 480 L482 450 M482 480 L458 450 M458 420 L482 390 M482 420 L458 390 M458 360 L482 330 M482 360 L458 330 M458 300 L482 270 M482 300 L458 270 M458 240 L482 210 M482 240 L458 210 M458 180 L482 150 M482 180 L458 150" />
        <path className="pl-draw" pathLength={1} style={d(2.4)} d="M470 118 L470 96 L430 118 M200 124 H506 M200 124 L470 96" />
        <g className="pl-crane-arm">
          <path className="pl-draw" pathLength={1} style={d(3)} d="M306 124 V262" />
          <path className="pl-draw" pathLength={1} style={d(3.2)} d="M292 262 H320 L314 280 H298 Z" />
          <rect x="285" y="282" width="42" height="26" stroke="#d4a843" strokeWidth="1.2" fill="rgba(212,168,67,0.12)" />
        </g>
        <path className="pl-draw thin" pathLength={1} style={d(2.6)} d="M470 118 L510 124" />

        {/* cotas */}
        <path className="pl-draw thin" pathLength={1} style={d(3.4)} d="M92 220 V500 M86 220 H98 M86 500 H98" />
        <text className="pl-label" style={d(4)} x="76" y="372" transform="rotate(-90 76 372)" textAnchor="middle">28,00 m</text>
        <path className="pl-draw thin" pathLength={1} style={d(3.6)} d="M120 534 H300 M120 528 V540 M300 528 V540" />
        <text className="pl-label" style={d(4.1)} x="210" y="552" textAnchor="middle">18,00 m</text>
        <path className="pl-draw thin" pathLength={1} style={d(3.8)} d="M324 534 H456 M324 528 V540 M456 528 V540" />
        <text className="pl-label" style={d(4.2)} x="390" y="552" textAnchor="middle">EST. 02</text>
        <text className="pl-label" style={d(4.3)} x="124" y="206">BLOCO A</text>
      </svg>

      <div className="pl-chip" style={{ ...d(3.6), top: '8%', left: '-2%' }}>
        CRONOGRAMA
        <b>87%</b>
        <i>▲ no prazo</i>
      </div>
      <div className="pl-chip" style={{ ...d(4.2), bottom: '16%', right: '-3%' }}>
        PREVISTO × REALIZADO
        <b>−2,1%</b>
        <i>dentro do orçamento</i>
      </div>
    </div>
  );
}
