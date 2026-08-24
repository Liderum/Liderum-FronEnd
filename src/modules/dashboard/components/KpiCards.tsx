import type { LucideIcon } from 'lucide-react';

interface KpiItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface KpiCardsProps {
  kpis: KpiItem[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 14,
    }}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            style={{
              background: 'var(--card-bg, #fff)',
              borderRadius: 12,
              border: '1px solid var(--bdr, rgba(26,24,20,0.10))',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.22s',
              cursor: 'default',
              boxShadow: '0 2px 10px rgba(26,24,20,0.04)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(26,24,20,0.09)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(26,24,20,0.04)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${kpi.color}, ${kpi.color}88)`,
            }} />
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: kpi.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon size={18} color={kpi.color} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-numeric)',
                fontSize: 26,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums lining-nums',
                color: 'var(--ink, #1A1814)',
                lineHeight: 1.1,
              }}>
                {kpi.value}
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase' as const,
                color: 'var(--ink3, #7A7670)',
                marginTop: 4,
              }}>
                {kpi.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
