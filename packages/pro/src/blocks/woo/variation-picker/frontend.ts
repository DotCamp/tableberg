export type VariationProps = {
    attributes: {
        slug: string;
        label: string;
        options: {
            slug: string;
            name: string;
        }[];
    }[];
    variations: {
        id: number;
        attributes: Record<string, string>;
    }[];
}

document.addEventListener("DOMContentLoaded", () => {
    const variationPickerContainers = document.querySelectorAll<HTMLElement>(
        ".tableberg-woo-variation-picker"
    );

    variationPickerContainers.forEach((variationPickerContainer) => {
        const variationProps: VariationProps = JSON.parse(
            variationPickerContainer.dataset.tablebergWooVariationProps || "{}"
        );

        if (!variationProps.attributes) {
            return;
        }

        variationProps.attributes.forEach((attribute) => {
            const select = document.createElement("select");
            select.setAttribute("name", attribute.slug);

            const optionElement = document.createElement("option");
            optionElement.setAttribute("value", "");
            optionElement.textContent = "Select " + attribute.label;
            select.appendChild(optionElement);

            attribute.options.forEach((option) => {
                const optionElement = document.createElement("option");
                optionElement.setAttribute("value", option.slug);
                optionElement.textContent = option.name;
                select.appendChild(optionElement);
            });

            variationPickerContainer.appendChild(select);
        });
    });
});