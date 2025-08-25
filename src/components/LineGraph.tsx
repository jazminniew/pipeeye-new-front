// src/components/LineGraph.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend
);

const data = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Radiografías analizadas',
      data: [320, 180, 240, 300, 400, 350, 370, 280, 310, 450, 500, 470],
      fill: true,
      backgroundColor: 'rgba(0, 123, 255, 0.2)',
      borderColor: '#00BFFF',
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#00BFFF',
      pointRadius: 5,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#00BFFF',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: '#fff' },
      grid: { display: false },
    },
    y: {
      ticks: { color: '#fff' },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
};

const LineGraph: React.FC = () => {
  return <Line data={data} options={options} />;
};

export default LineGraph;
