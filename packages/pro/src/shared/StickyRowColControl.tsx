import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { PanelBody, ToggleControl } from "@wordpress/components";

interface Props {
    attrs: TablebergBlockAttrs;
    setAttrs: (attrs: Partial<TablebergBlockAttrs>) => void;
}

export default function StickyRowColControl({ attrs, setAttrs }: Props) {
    return (
        <PanelBody title="[PRO] Table Sticky Row/Col">
            <ToggleControl
                checked={attrs.stickyTopRow}
                label="Sticky Top Row"
                onChange={(stickyTopRow) => {
                    setAttrs({
                        stickyTopRow,
                    });
                }}
            />
            <ToggleControl
                checked={attrs.stickyFirstCol}
                label="Sticky First Col"
                onChange={(stickyFirstCol) => {
                    setAttrs({
                        stickyFirstCol,
                    });
                }}
            />
        </PanelBody>
    );
}
