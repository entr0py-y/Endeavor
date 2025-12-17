import React, { useState, useCallback, ReactNode } from 'react';

interface MicroGlitchProps {
    children: ReactNode;
    text?: string; // Optional: if provided, uses the high-quality pseudo-element glitch
    className?: string; // Wrapper classes
    onClick?: () => void;
}

export default function MicroGlitch({ children, text, className = '', onClick }: MicroGlitchProps) {
    const [isGlitching, setIsGlitching] = useState(false);

    const triggerGlitch = useCallback(() => {
        if (!isGlitching) {
            setIsGlitching(true);
            // Duration < 300ms as requested
            setTimeout(() => setIsGlitching(false), 300);
        }
    }, [isGlitching]);

    return (
        <div
            className={`relative inline-block ${className} ${isGlitching ? 'micro-glitch-active' : ''}`}
            onMouseEnter={triggerGlitch}
            onClick={onClick}
            data-text={text} // Used by CSS for the text content clone
        >
            {/* If text is provided, the CSS ::before/::after will handle the glitch clones. 
          The main children are rendered normally. 
          We might need to hide the children momentarily or blend them? 
          Actually, standard glitch keeps main text and adds offset clones.
      */}
            {children}
        </div>
    );
}
