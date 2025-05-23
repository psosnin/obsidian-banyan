import { useState } from "react";
import { Icon } from "src/components/Icon";

interface SidebarButtonProps {
    iconName?: string;
    label: string;
    selected?: boolean;
    onClick?: () => void;
    rightLabel?: string;
    rightIconName?: string;
    onClickRightIcon?: (e: MouseEvent) => void;
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({ iconName, label, selected = false, onClick,
    rightIconName, rightLabel, onClickRightIcon
}) => {
    const [hover, setHover] = useState(false);
    const baseStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 4,
        gap: 6,
        borderRadius: 8,
        color: selected ? 'var(--text-normal)' : 'var(--text-muted)',
        background: selected ? 'var(--background-secondary-alt)' : hover ? 'var(--background-secondary)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
        height: 36,
    };
    return (
        <div
            style={baseStyle}
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {iconName && <Icon name={iconName} size="m" color={selected ? 'var(--text-normal)' : 'var(--text-muted)'} />}
            <span style={{
                fontWeight: selected ? 'var(--bold-weight)' : 'var(--font-normal)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                display: 'inline-block'
            }}>{label}</span>
            <div className="sidebar-btn-right" style={{ display: "flex", gap: 12, alignItems: 'center' }}>
                {rightLabel && <span style={{ fontSize: 'var(--font-smaller)' }}>{rightLabel}</span>}
                {rightIconName && <button className="clickable-icon" onClick={(e) => {
                    e.stopPropagation();
                    onClickRightIcon && onClickRightIcon(e.nativeEvent);
                }} style={{ marginRight: 4 }}>
                    <Icon name={rightIconName} size="s" color={selected ? 'var(--text-normal)' : 'var(--text-muted)'} />
                </button>}
            </div>
        </div>
    );
};