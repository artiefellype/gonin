import React from "react";

const CardSkeleton = () => {
  return (
    <div className="w-full">
      <div className="mb-4 h-52 w-full rounded-lg border border-slate-200 bg-whiteColor p-4 shadow-sm">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-400 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-400 rounded col-span-2"></div>
                <div className="h-2 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="h-52 w-full rounded-lg border border-slate-200 bg-whiteColor p-4 shadow-sm">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-400 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-400 rounded col-span-2"></div>
                <div className="h-2 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
