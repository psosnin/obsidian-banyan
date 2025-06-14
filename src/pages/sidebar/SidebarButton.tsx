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
    return (
        <div
            className={"sidebar-btn-base " + (selected ? " sidebar-btn-selectd" : hover ? " sidebar-btn-hover" : " sidebar-btn-normal")}
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* 左侧图标 */}
            {leftIconName && onClickLeftIcon && <button className="sidebar-btn-left-icon-clickable clickable-icon"
                onClick={(e) => {
                    e.stopPropagation();
                    onClickLeftIcon();
                }} >
                <Icon size="m" name={leftIconName} color={selected ? 'var(--text-normal)' : 'var(--text-muted)'} />
            </button>}
            {leftIconName && !onClickLeftIcon && <div className="sidebar-btn-left-icon-unclickable">
                <Icon size="m" name={leftIconName} color={selected ? 'var(--text-normal)' : 'var(--text-muted)'} />
            </div>}
            {!leftIconName && <div className="sidebar-btn-left-margin"></div>}

            {/* 文本 */}
            <span className={"sidebar-btn-text " + (selected ? "sidebar-btn-text-selected" : "sidebar-btn-text-normal")}>{label}</span>

            {/* 右侧 */}
            <div className="sidebar-btn-right">
                {/* 右侧文案 */}
                {rightLabel && <span className="sidebar-btn-right-label">{rightLabel}</span>}
                {/* 右侧图标 */}
                {rightIconName && <button className="clickable-icon sidebar-btn-right-icon" onClick={(e) => {
                    e.stopPropagation();
                    onClickRightIcon && onClickRightIcon(e.nativeEvent);
                }}>
                    <Icon name={rightIconName} size="s" color={selected ? 'var(--text-normal)' : 'var(--text-muted)'} />
                </button>}
            </div>
        </div>
    );
};