import React from "react";

const CardSkeleton = () => {
  return (
    <div className="w-full md:max-w-2xl">
      <div className="border border-white shadow w-full md:max-w-2xl h-52 mb-4 rounded-lg p-4 bg-white">
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

      
      <div className="border border-white shadow w-full md:max-w-2xl h-52  rounded-lg p-4 bg-white">
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
