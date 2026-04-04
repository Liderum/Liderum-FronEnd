import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, DollarSign, Shield, Activity } from 'lucide-react';
import type { RiskAlert } from '@/modules/shared/types';
import { RISK_CONFIG } from '@/modules/shared/types';

interface RiskAlertsProps {
  alerts: RiskAlert[];
}

const typeIcons: Record<string, typeof AlertTriangle> = {
  prazo: Clock,
  orcamento: DollarSign,
  qualidade: Shield,
  seguranca: Activity,
};

export function RiskAlerts({ alerts }: RiskAlertsProps) {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid var(--bdr, rgba(26,24,20,0.10))',
      boxShadow: '0 2px 10px rgba(26,24,20,0.04)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {alerts.map((alert, i) => {
        const riskCfg = RISK_CONFIG[alert.severity];
        const TypeIcon = typeIcons[alert.type] || AlertTriangle;
        return (
          <div
            key={alert.id}
            onClick={() => navigate(`/works/${alert.workId}`)}
            style={{
              padding: '14px 18px',
              borderBottom: i < alerts.length - 1 ? '1px solid rgba(26,24,20,0.06)' : 'none',
              display: 'flex',
              gap: 12,
              cursor: 'pointer',
              transition: 'background 0.14s',
              alignItems: 'flex-start',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream, #F7F4EF)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: riskCfg.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}>
              <TypeIcon size={15} color={riskCfg.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink, #1A1814)' }}>{alert.workName}</span>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: 10,
                  background: riskCfg.bg,
                  color: riskCfg.color,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}>
                  {riskCfg.label}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink3, #7A7670)', lineHeight: 1.45 }}>
                {alert.message}
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(26,24,20,0.35)', marginTop: 4 }}>
                {alert.date}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
