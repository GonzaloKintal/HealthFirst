import React from 'react';

const SectionBase = React.forwardRef(({ id, icon, children }, ref) => {
  return (
    <section 
      id={id} 
      ref={ref}
      className="scroll-mt-5 border-b border-border pb-6 last:border-b-0"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1 text-foreground">
          {icon}
        </div>
        <div className="ml-3">
          {children}
        </div>
      </div>
    </section>
  );
});

SectionBase.displayName = 'SectionBase';

export default SectionBase;