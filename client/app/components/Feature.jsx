import React from "react";

const Feature = ({icon,title,description}) => {
  return (
    <div className="rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4F39F6]">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-6 font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
};

export default Feature;
