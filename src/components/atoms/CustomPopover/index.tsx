import React, { useEffect, useRef, useState } from "react";

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
}

export const CustomPopover = ({ trigger, content }: PopoverProps) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = () => {
    setPopoverVisible(!popoverVisible);
  };

  const closePopover = () => {
    setPopoverVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        closePopover();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation();
          togglePopover();
        }}
      >
        {trigger}
      </div>
      {popoverVisible && (
        <div
          className={`absolute z-10 bg-white w-36 shadow-md top-full right-0 transition-transform duration-300 ${
            popoverVisible
              ? "transform translate-y-0 opacity-100"
              : "transform translate-y-full opacity-0"
          }`}
          ref={popoverRef}
        >
          {content}
        </div>
      )}
    </div>
  );
};
