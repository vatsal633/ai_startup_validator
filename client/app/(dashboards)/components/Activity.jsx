import React from 'react'

const Activity = ({activity}) => {
   return (
    <div className="flex gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800">
        {activity.icon}
      </div>

      <div className="min-w-0">

        <p className="text-sm font-medium">
          {activity.title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {activity.description}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          {activity.time}
        </p>

      </div>

    </div>
  );
}

export default Activity