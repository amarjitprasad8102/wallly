import { useEffect, useRef } from 'react';

interface SecureImageProps {
  src: string;
  alt?: string;
  className?: string;
}

// Secure image component that prevents downloading
const SecureImage = ({ src, alt = 'Image', className = '' }: SecureImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent right-click context menu
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag and drop
    const handleDragStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Invisible overlay to prevent interactions */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ 
          pointerEvents: 'auto',
          WebkitTouchCallout: 'none',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain pointer-events-none"
        style={{
          userSelect: 'none',
          pointerEvents: 'none',
        } as React.CSSProperties}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
};

export default SecureImage;
