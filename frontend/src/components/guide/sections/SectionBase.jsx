import React from 'react';

const SectionBase = React.forwardRef(({ id, icon, children }, ref) => {
  return (
    <section 
      id={id} 
      ref={ref}
      className="scroll-mt-5 border-b border-border pb-6 last:border-b-0"
    >
      {children}
    </section>
  );
});

SectionBase.displayName = 'SectionBase';

export default SectionBase;