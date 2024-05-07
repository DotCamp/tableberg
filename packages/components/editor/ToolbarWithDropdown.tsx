import { ToolbarGroup } from "@wordpress/components";
import {
    alignNone,
    positionLeft,
    positionCenter,
    positionRight,
    stretchFullWidth,
    stretchWide,
} from "@wordpress/icons";

interface ToolbarGroupControlProps {
    icon?: JSX.Element;
    title: string;
    value?: string;
    onClick?: () => void;
}

interface AlignmentToolbarProps {
    icon?: JSX.Element;
    title: string;
    onChange: (newAlign?: string) => void;
    value: string | undefined;
    controls?: ToolbarGroupControlProps[];
    controlset?: "alignment" | "all";
}

const alignControls: ToolbarGroupControlProps[] = [
    {
        icon: alignNone,
        title: "None",
        value: undefined,
    },
    {
        icon: positionLeft,
        title: "Align left",
        value: "left",
    },
    {
        icon: positionCenter,
        title: "Align center",
        value: "center",
    },
    {
        icon: positionRight,
        title: "Align right",
        value: "right",
    },
];

const alignControlsWithWidth: ToolbarGroupControlProps[] = [
    {
        icon: alignNone,
        title: "None",
        value: undefined,
    },
    {
        icon: positionLeft,
        title: "Align left",
        value: "left",
    },
    {
        icon: positionCenter,
        title: "Align center",
        value: "center",
    },
    {
        icon: positionRight,
        title: "Align right",
        value: "right",
    },
    {
        icon: stretchWide,
        title: "Wide width",
        value: "wide",
    },
    {
        icon: stretchFullWidth,
        title: "Full Width",
        value: "full",
    },
];

export default function ToolbarWithDropdown({
    title,
    onChange,
    value,
    controls,
    controlset,
}: AlignmentToolbarProps) {
    const controlsets: Record<string, ToolbarGroupControlProps[]> = {
        alignment: alignControls,
        all: alignControlsWithWidth,
    };

    if (controlset) {
        controls = controlsets[controlset];
    }

    if (controls) {
        return (
            <ToolbarGroup
                icon={controls.find((i) => i.value === value)!.icon}
                title={title}
                isCollapsed
                controls={controls.map((control) => {
                    return {
                        ...control,
                        onClick: () => onChange(control.value),
                        isActive: value === control.value,
                    };
                })}
            />
        );
    }
}
