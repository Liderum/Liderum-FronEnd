import { useMemo } from 'react';
import type { ScheduleTask } from '@/modules/shared/types';
import { TASK_STATUS_CONFIG } from '@/modules/shared/types';

const CSS = `
.gantt{background:var(--card-bg,#fff);border-radius:12px;border:1px solid var(--bdr,rgba(26,24,20,0.10));overflow:hidden;box-shadow:0 2px 10px rgba(26,24,20,0.04);font-family:'DM Sans',sans-serif;}
.gantt-header{display:grid;grid-template-columns:240px 1fr;border-bottom:1px solid var(--bdr,rgba(26,24,20,0.08));background:var(--cream,#fafaf7);}
.gantt-head-name{padding:10px 16px;font-size:10.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--ink3,#7A7670);}
.gantt-timeline{position:relative;height:30px;display:flex;align-items:center;}
.gantt-month{flex:1;text-align:center;font-size:10.5px;color:var(--ink3,#7A7670);font-weight:500;border-left:1px solid var(--bdr,rgba(26,24,20,0.06));padding:6px 0;}
.gantt-row{display:grid;grid-template-columns:240px 1fr;border-bottom:1px solid var(--bdr,rgba(26,24,20,0.04));min-height:40px;align-items:center;}
.gantt-row:hover{background:var(--cream,#fafaf7);}
.gantt-name{padding:8px 16px;font-size:12.5px;color:var(--ink,#1A1814);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.gantt-name small{display:block;font-size:10.5px;color:var(--ink3,#7A7670);margin-top:1px;}
.gantt-track{position:relative;height:40px;}
.gantt-track::before{content:'';position:absolute;inset:0;background-image:linear-gradient(to right,var(--bdr,rgba(26,24,20,0.04)) 1px,transparent 1px);background-size:calc(100%/var(--months,1)) 100%;}
.gantt-bar{position:absolute;top:10px;height:20px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:flex-start;overflow:hidden;cursor:pointer;}
.gantt-bar-fill{height:100%;opacity:0.9;}
.gantt-bar-pct{margin-left:8px;font-size:10.5px;font-weight:700;font-family:var(--font-numeric);color:var(--ink,#1A1814);white-space:nowrap;}
.gantt-dep-line{position:absolute;border-top:1.5px dashed rgba(26,24,20,0.25);pointer-events:none;}
`;

interface Props {
  tasks: ScheduleTask[];
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export default function GanttView({ tasks }: Props) {
  const computed = useMemo(() => {
    if (tasks.length === 0) return null;
    // Usa "T00:00:00" sem Z para interpretar como hora local e evitar conversão de fuso horário
    const starts = tasks.map((t) => new Date(t.startDate.substring(0, 10) + 'T00:00:00'));
    const ends = tasks.map((t) => new Date(t.endDate.substring(0, 10) + 'T00:00:00'));
    const minDate = startOfMonth(new Date(Math.min(...starts.map((d) => d.getTime()))));
    const maxDate = endOfMonth(new Date(Math.max(...ends.map((d) => d.getTime()))));
    const totalDays = Math.max(1, daysBetween(minDate, maxDate));

    const months: string[] = [];
    const cursor = new Date(minDate);
    while (cursor <= maxDate) {
      months.push(cursor.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return { minDate, totalDays, months };
  }, [tasks]);

  if (!computed) {
    return <div style={{ padding: 30, textAlign: 'center', color: 'var(--ink3, #7A7670)' }}>Sem tarefas para exibir.</div>;
  }

  const { minDate, totalDays, months } = computed;

  return (
    <>
      <style>{CSS}</style>
      <div className="gantt" style={{ ['--months' as string]: months.length }}>
        <div className="gantt-header">
          <div className="gantt-head-name">Tarefa</div>
          <div className="gantt-timeline">
            {months.map((m) => (
              <div key={m} className="gantt-month">{m}</div>
            ))}
          </div>
        </div>
        {tasks.map((task) => {
          const start = new Date(task.startDate.substring(0, 10) + 'T00:00:00');
          const end = new Date(task.endDate.substring(0, 10) + 'T00:00:00');
          const offsetDays = daysBetween(minDate, start);
          const durationDays = Math.max(1, daysBetween(start, end));
          const left = (offsetDays / totalDays) * 100;
          const width = (durationDays / totalDays) * 100;
          const cfg = TASK_STATUS_CONFIG[task.status];
          // Perto do fim da faixa: rótulo vai para a esquerda da barra pra não ser cortado pelo overflow:hidden do container.
          const pctOnLeft = left + width > 88;
          return (
            <div key={task.id} className="gantt-row">
              <div className="gantt-name">
                {task.name}
                <small>{task.responsible} · {task.stage}</small>
              </div>
              <div className="gantt-track" style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  className="gantt-bar"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}`,
                  }}
                  title={`${task.name}\n${task.startDate} → ${task.endDate}\n${task.progress}%`}
                >
                  <div
                    className="gantt-bar-fill"
                    style={{ width: `${task.progress}%`, background: cfg.color }}
                  />
                </div>
                <span
                  className="gantt-bar-pct"
                  style={
                    pctOnLeft
                      ? { position: 'absolute', right: `calc(100% - ${left}% + 6px)`, marginLeft: 0 }
                      : { position: 'absolute', left: `calc(${left}% + ${width}% + 6px)` }
                  }
                >
                  {task.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
