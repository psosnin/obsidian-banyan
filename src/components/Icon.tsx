import { useLayoutEffect, useRef } from 'react';
import { setIcon } from 'obsidian';

export const Icon = ({ name, size = 's', color = 'var(--icon-color)', className }: {
  name: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl' | number;
  color?: string;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setIcon(ref.current, name);
      if (typeof size === 'string') {
        ref.current.style.setProperty('--icon-size', `var(--icon-${size}`);
      } else {
        ref.current.style.setProperty('--icon-size', `${size}px`);
      }

    }
  }, [name, size]);

  return <div ref={ref} className={`${className ?? ""}`} style={{
    height: `var(--icon-size)`,
    width: 'var(--icon-size)',
    color: color,
  }} />;
}