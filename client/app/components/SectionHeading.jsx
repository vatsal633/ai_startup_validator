import React from 'react'

const SectionHeading = ({label,title}) => {
  return (
    <div className="text-center">

      <span className="text-xs font-bold tracking-widest text-indigo-600">
        {label}
      </span>

      <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h2>

    </div>
  );
}

export default SectionHeading