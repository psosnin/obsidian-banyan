import { useLayoutEffect, useRef } from 'react';
import { setIcon } from 'obsidian';

export function Icon({ name, size = 's', color = 'var(--icon-color)', className }: {
  name: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setIcon(ref.current, name);
      ref.current.style.setProperty('--icon-size', `var(--icon-${size}`);
    }
  }, [name, size]);

  return <div ref={ref} className={`${className ?? ""}`} style={{ 
    height: `var(--icon-size)`,
    width: 'var(--icon-size)',
    color: color,
  }} />;
}