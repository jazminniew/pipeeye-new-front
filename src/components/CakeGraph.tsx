import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { LegendPayload } from 'recharts/types/component/DefaultLegendContent';

type Props = {
  height?: number;
  className?: string;
  data?: { name: string; value: number }[];
  colors?: string[];
};

const DEFAULT_CAKE_HEIGHT = 300;

const DEFAULT_DATA: { name: string; value: number }[] = [
  { name: 'Aprobadas', value: 65 },
  { name: 'En revisión', value: 15 },
  { name: 'Reprobadas', value: 20 },
];

/** Paleta solo azules/celestes */
const DEFAULT_COLORS = ['#60A5FA', '#3B82F6', '#1D4ED8'];

/** Label centrado: muestra % siempre (sin hover) */
const renderCustomizedLabel = (props: any) => {
  const RAD = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);

  // ocultá etiquetas de slices muy chicos si querés:
  if (percent < 0.04) return null; // < 4%

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      style={{ pointerEvents: 'none' }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

/** Leyenda tipo chips para “qué color es qué” */
const LegendChips: React.FC<{ payload?: ReadonlyArray<LegendPayload> }> = ({
  payload = [],
}) => (
  <div
    style={{
      display: 'flex',
      gap: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingTop: 8,
      paddingBottom: 4,
    }}
  >
    {payload.map((entry, i) => (
      <span
        key={i}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          fontSize: 12,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: entry.color ?? '#999',
            display: 'inline-block',
          }}
        />
        {String(entry.value ?? '')}
      </span>
    ))}
  </div>
);

const CakeGraph: React.FC<Props> = ({
  height,
  className,
  data = DEFAULT_DATA,
  colors = DEFAULT_COLORS,
}) => {
  const H = height ?? DEFAULT_CAKE_HEIGHT;

  return (
    <div
      style={{ width: '100%', height: H, userSelect: 'none' }}
      className={className}
      onMouseDown={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 40, left: 0 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={100}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
            labelLine={false}
            label={renderCustomizedLabel}  // 👈 porcentajes siempre visibles
            isAnimationActive
            animationBegin={100}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background: 'rgba(17,24,39,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              color: '#fff',
              backdropFilter: 'blur(6px)',
              fontSize: 12,
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: 'rgba(255,255,255,0.85)' }}
          />

          <Legend
            verticalAlign="bottom"
            align="center"
            content={(props) => (
              <LegendChips
                payload={props.payload as ReadonlyArray<LegendPayload> | undefined}
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CakeGraph;
