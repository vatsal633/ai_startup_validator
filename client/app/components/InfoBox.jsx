import React from 'react'

const InfoBox = ({label,value}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>

    </div>
  );
}

export default InfoBox