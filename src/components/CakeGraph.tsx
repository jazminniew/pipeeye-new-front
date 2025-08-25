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

/** Alto por defecto si no se pasa desde el padre */
const DEFAULT_CAKE_HEIGHT = 300;

/** Data por defecto (cambiá por la tuya si querés) */
const DEFAULT_DATA: { name: string; value: number }[] = [
  { name: 'Aprobadas', value: 65 },
  { name: 'En revisión', value: 15 },
  { name: 'Reprobadas', value: 20 },
];

/** Colores por defecto */
const DEFAULT_COLORS = ['#4CA3FF', '#4cff9a', '#FF6B6B'];

/** Label centrado con porcentaje (sin tocar tu estilo) */
const renderCustomizedLabel = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

/** Legend custom tipo “chips” (tipado con readonly) */
const LegendChips: React.FC<{ payload?: ReadonlyArray<LegendPayload> }> = ({
  payload = [],
}) => {
  return (
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
};

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
      onMouseDown={(e) => e.preventDefault()}   // bloquea selección/drag
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
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            stroke="#2b2b2b"
            strokeWidth={1}
          >
            {data.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>

          <Tooltip />
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
