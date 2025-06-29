import { BlockEditProps, registerBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import metadata from "./block.json";

type VariationPickerAttrs = {
    variationProps: {
        attributes: {
            slug: string;
            label: string;
            options: {
                slug: string;
                name: string;
            }[];
        }[];
    };
}

function edit({ attributes }: BlockEditProps<VariationPickerAttrs>) {
    const { attributes: productAttrs = [] } = attributes.variationProps;

    return <div {...useBlockProps()}>
        {productAttrs.map((attr) => (
            <div key={attr.slug}>
                <select>
                    <option value="">Select {attr.label}</option>
                    {attr.options.map((option) => (
                        <option key={option.slug} value={option.slug}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        ))}
    </div>;
}

registerBlockType(metadata as any, {
    edit,
    save: () => null,
});