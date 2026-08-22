import React from "react";

const CardSkeleton = () => {
  const skeletonItem = (
    <div className="h-48 w-full border-b border-borderDark bg-background/70 p-3 sm:h-52 sm:p-4 md:bg-background">
      <div className="flex animate-pulse space-x-4">
        <div className="h-9 w-9 rounded-full bg-secondary sm:h-10 sm:w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-2 rounded bg-secondary"></div>
              <div className="col-span-1 h-2 rounded bg-secondary"></div>
            </div>
            <div className="h-2 rounded bg-secondary"></div>
            <div className="h-2 w-4/5 rounded bg-secondary"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {skeletonItem}
      {skeletonItem}
    </div>
  );
};

export default CardSkeleton;
