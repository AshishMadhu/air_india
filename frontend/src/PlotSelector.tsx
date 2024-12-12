import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";

type PlotType = "BarPlot" | "PiePlot" | "ScatterPlot" | "LinePlot";

interface PlotSelectorProps {
  handlePlotSelectClick: (clicked: string) => void;
}

const PlotSelector: React.FC<PlotSelectorProps> = ({
  handlePlotSelectClick,
}) => {
  const [selectedPlot, setSelectedPlot] = useState<PlotType | null>(null);

  const plotTypes: PlotType[] = [
    "BarPlot",
    "PiePlot",
    "ScatterPlot",
    "LinePlot",
  ];

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        <div className="mb-3 p-3 bg-light rounded">
          <p className="text-muted mb-2">
            <strong>Select any of these plot types:</strong>
          </p>
        </div>

        <div className="d-flex flex-column gap-2">
          {plotTypes.map((plot) => (
            <Button
              key={plot}
              variant="outline-primary"
              className="text-start py-2 px-3 plot-button"
              onClick={() => {
                setSelectedPlot(plot);
                handlePlotSelectClick(plot);
              }}
              style={{
                borderRadius: "20px",
                backgroundColor: selectedPlot === plot ? "#e6f2ff" : "white",
                border:
                  selectedPlot === plot
                    ? "2px solid #007bff"
                    : "1px solid #ced4da",
              }}
            >
              {plot}
            </Button>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlotSelector;
