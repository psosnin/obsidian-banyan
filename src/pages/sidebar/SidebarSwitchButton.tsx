import { BaseSidebarButton } from "./BaseSidebarButton";

interface SidebarSwitchButtonProps {
    leftIconName?: string;
    onClickLeftIcon?: () => void;
    label: string;
    selected?: boolean;
    onClick?: () => void;
    isOn: boolean;
    onSwitch: (value: boolean) => void;
    switchDisabled?: boolean;
}

export const SidebarSwitchButton: React.FC<SidebarSwitchButtonProps> = ({
    leftIconName,
    onClickLeftIcon,
    label,
    selected = false,
    onClick,
    isOn,
    onSwitch,
    switchDisabled = false,
}) => {
    const handleSwitchClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!switchDisabled) {
            onSwitch(!isOn);
        }
    };

    const switchContent = (
        <div className={'checkbox-container ' + (isOn ? 'is-enabled' : '')}
            onClick={handleSwitchClick}>
            <input type='checkbox' />
        </div>
    );

    return (
        <BaseSidebarButton
            leftIconName={leftIconName}
            onClickLeftIcon={onClickLeftIcon}
            label={label}
            selected={selected}
            onClick={onClick}
            rightContent={switchContent}
        />
    );
}; 