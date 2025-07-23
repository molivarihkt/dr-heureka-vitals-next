import {Radar} from "react-chartjs-2";

export function VitalsRadar({data}) {
  const Labesl_Radar = ["Activity", "Sleep", "Equilibruium", "Metabolism", "Health", "Relaxation"];

  const RadarChartData = {
    labels: Labesl_Radar, datasets: [{
      backgroundColor: "rgba(60, 186, 162, 0.5)",
      borderColor: "rgb(60, 186, 162)",
      borderWidth: 2,
      pointBackgroundColor: "rgb(60, 186, 162)",
      data
    },],
  };
  const options = {
    plugins: {
      legend: {
        position: 'top',
        display: false,
      },
    },
    maintainAspectRatio: true, spanGaps: false, elements: {
      line: {
        tension: 0.000001,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        angleLines: {
          display: true,
        },
        grid: {
          color: ["grey", "grey", "grey", "grey", "grey"],
          display: true
        },
        ticks: {
          stepSize: 1,
        },
        max: 5,
        min: 0
      }
    }

  };
  return <Radar data={RadarChartData} options={options}/>;
}