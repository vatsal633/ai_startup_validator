import React from "react";

const Metric = ({name,value,percentage}) => {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{name}</span>

        <span className="font-semibold">{value}</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
};

export default Metric;
