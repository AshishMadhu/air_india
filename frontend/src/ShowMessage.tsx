import React from "react";
import PlotSelector from "./PlotSelector";
import BarGraph from "./BarGraph";
import PieGraph from "./PieGraph";
import ScatterGraph from "./ScatterGraph";
import LineGraph from "./LineGraph";

interface ShowMessageProps {
  message: string;
  handlePlotSelectClick: (clicked: string) => void;
}

const ShowMessage: React.FC<ShowMessageProps> = ({
  message,
  handlePlotSelectClick,
}) => {
  if (message == "#")
    return <PlotSelector handlePlotSelectClick={handlePlotSelectClick} />;
  else if (message == "#1") return <BarGraph />;
  else if (message == "#2") return <PieGraph />;
  else if (message == "#3") return <ScatterGraph />;
  else if (message == "#4") return <LineGraph />;
  else return message;
};

export default ShowMessage;
