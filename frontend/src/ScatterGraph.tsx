import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);

interface ScatterGraphProps {
  title?: string;
}

const ScatterGraph: React.FC<ScatterGraphProps> = ({
  title = "Sample Scatter Graph",
}) => {
  const data = {
    datasets: [
      {
        label: "Dataset 1",
        data: [
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 7 },
          { x: 4, y: 5 },
          { x: 5, y: 9 },
        ],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Dataset 2",
        data: [
          { x: 1, y: 5 },
          { x: 2, y: 2 },
          { x: 3, y: 4 },
          { x: 4, y: 6 },
          { x: 5, y: 3 },
        ],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
    },
  };

  return (
    <div style={{ width: "600px", margin: "auto" }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

export default ScatterGraph;
