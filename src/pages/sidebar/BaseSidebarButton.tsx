import { useState } from "react";
import { Icon } from "src/components/Icon";

interface BaseSidebarButtonProps {
    leftIconName?: string;
    onClickLeftIcon?: () => void;
    
    label: string;
    selected?: boolean;
    onClick?: () => void;

    rightContent?: React.ReactNode;
}

export const BaseSidebarButton: React.FC<BaseSidebarButtonProps> = ({
    leftIconName,
    onClickLeftIcon,
    label,
    selected = false,
    onClick,
    rightContent,
}) => {
    const [hover, setHover] = useState(false);
    return (
        <div
            className={"sidebar-btn-base " + (selected ? " sidebar-btn-selectd" : (onClick && hover) ? " sidebar-btn-hover" : " sidebar-btn-normal")}
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
                {rightContent}
            </div>
        </div>
    );
}; 