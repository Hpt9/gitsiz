import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const Tooltip = ({ children, content, openDelay = 0, closeDelay = 0 }) => {
  return (
    <TooltipPrimitive.Provider delayDuration={openDelay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="bg-white px-4 py-2 rounded-md shadow-lg text-sm"
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-white" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}; 