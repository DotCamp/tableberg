import {
    ToggleControl,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";
import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { __ } from "@wordpress/i18n";
import { InspectorControls } from "@wordpress/block-editor";

interface Props {
    clientId: string;
    setAttr: (attrs: Partial<TablebergBlockAttrs>) => void;
    value: any;
}
const RowColOnlyBorderControl = ({ clientId, setAttr, value }: Props) => {
    return (
        <InspectorControls group="border">
            <ToolsPanelItem
                panelId={clientId}
                isShownByDefault={true}
                resetAllFilter={() =>
                    setAttr({
                        innerBorderType: "",
                    })
                }
                hasValue={() => !value}
                label={__("[PRO] Column Only Border", "tableberg-pro")}
                onDeselect={() => {
                    setAttr({ innerBorderType: "" });
                }}
            >
                <ToggleControl
                    label={__("[PRO] Column Only Border", "tableberg-pro")}
                    checked={value === "col"}
                    onChange={(checked) =>
                        setAttr({
                            innerBorderType: checked ? "col" : "",
                        })
                    }
                />
            </ToolsPanelItem>
            <ToolsPanelItem
                panelId={clientId}
                isShownByDefault={true}
                resetAllFilter={() =>
                    setAttr({
                        innerBorderType: "",
                    })
                }
                hasValue={() => !value}
                label={__("[PRO] Row Only Border", "tableberg-pro")}
                onDeselect={() => {
                    setAttr({ innerBorderType: "" });
                }}
            >
                <ToggleControl
                    label={__("[PRO] Row Only Border", "tableberg-pro")}
                    checked={value === "row"}
                    onChange={(checked) =>
                        setAttr({
                            innerBorderType: checked ? "row" : "",
                        })
                    }
                />
            </ToolsPanelItem>
        </InspectorControls>
    );
};

export default RowColOnlyBorderControl;
