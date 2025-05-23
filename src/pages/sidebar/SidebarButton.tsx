import { useState } from "react";
import { Icon } from "src/components/Icon";

interface SidebarButtonProps {
    leftIconName?: string;
    onClickLeftIcon?: () => void;

    label: string;
    selected?: boolean;
    onClick?: () => void;

    rightLabel?: string;
    rightIconName?: string;
    onClickRightIcon?: (e: MouseEvent) => void;
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({
    leftIconName,
    onClickLeftIcon,
    label,
    selected = false,
    onClick,
    rightIconName,
    rightLabel,
    onClickRightIcon,
}) => {
    const [hover, setHover] = useState(false);
    const iconMargin = 28;
    const baseStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12, // 根据缩进级别增加左边距
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
            {/* 左侧图标 */}
            {leftIconName && onClickLeftIcon && <button className="clickable-icon" style={{ cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClickLeftIcon();
                }} >
                <Icon size="m" name={leftIconName} color={selected ? 'var(--text-normal)' : 'var(--text-muted)'} />
            </button>}
            {leftIconName && !onClickLeftIcon && <div style={{ padding: '4px 6px' }} >
                <Icon size="m" name={leftIconName} color={selected ? 'var(--text-normal)' : 'var(--text-muted)'} />
            </div>}
            {!leftIconName && <div style={{ marginLeft: iconMargin }}></div>}

            {/* 文本 */}
            <span style={{
                fontWeight: selected ? 'var(--bold-weight)' : 'var(--font-normal)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                display: 'inline-block', fontSize: 'var(--font-small)'
            }}>{label}</span>

            {/* 右侧 */}
            <div className="sidebar-btn-right" style={{ display: "flex", gap: 12, alignItems: 'center' }}>
                {/* 右侧文案 */}
                {rightLabel && <span style={{ fontSize: 'var(--font-smaller)' }}>{rightLabel}</span>}
                {/* 右侧图标 */}
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