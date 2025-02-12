import React from "react";

interface ProgressProps {
  value: number; // Progress value (percentage)
}

const Progress: React.FC<ProgressProps> = ({ value }) => {
  return (
    <div className="relative w-full h-4 bg-gray-300 rounded-md overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default Progress;
