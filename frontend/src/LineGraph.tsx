import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineGraphProps {
  title?: string;
}

const LineGraph: React.FC<LineGraphProps> = ({
  title = "Sample Line Graph",
}) => {
  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Revenue",
        data: [50, 60, 70, 80, 90, 100],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        pointBorderColor: "rgba(75, 192, 192, 1)",
        pointBackgroundColor: "rgba(255, 255, 255, 1)",
        pointBorderWidth: 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
        pointHoverBorderColor: "rgba(220, 220, 220, 1)",
        pointRadius: 3,
        pointHitRadius: 10,
        fill: true,
        tension: 0.4,
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
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Revenue ($)",
        },
      },
    },
  };

  return (
    <div style={{ width: "600px", margin: "auto" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineGraph;
