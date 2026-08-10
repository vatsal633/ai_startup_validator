import React from 'react'

const Step = ({number,title,description}) => {
  return (
    <div>

      <span className="text-sm font-bold text-indigo-600">
        {number}
      </span>

      <h3 className="mt-5 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default Step