// Graph.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Graph = () => {
  // Data for the chart
  const data = {
    labels: Array.from({ length: 10 }, (_, i) => i + 1), // X-axis labels: 1, 2, 3, ..., 10
    datasets: [
      {
        label: 'Data Points',
        data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)), // Random y-values for 10 points
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true
      }
    }
  };

  return (
    <div className="chart-container">
      <h2>Line Chart with 10 Points</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default Graph;
