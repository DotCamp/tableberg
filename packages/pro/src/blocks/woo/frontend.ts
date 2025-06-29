document.addEventListener("DOMContentLoaded", () => {
    const wooCartButtons = document.querySelectorAll<HTMLElement>(
        ".wp-block-tableberg-button[data-tableberg-woo-product-id]"
    );

    wooCartButtons.forEach((wooCartButton) => {
        wooCartButton.addEventListener("click", async () => {
            const product_id = wooCartButton.dataset.tablebergWooProductId;

            const variationPicker = wooCartButton.closest("tr")?.querySelector<HTMLDivElement>(".tableberg-woo-variation-picker");

            if (variationPicker && variationPicker.dataset.tablebergWooVariationProps !== "[]") {
                await handleVariableProduct(variationPicker, product_id!);
                return;
            }

            if (window.wc) {
                await wp.data.dispatch(wc.wcBlocksData.cartStore)
                    .addItemToCart(product_id, 1);
            }

            if (window.wc_add_to_cart_params) {
                jQuery.ajax({
                    type: 'post',
                    url: wc_add_to_cart_params.wc_ajax_url.replace(
                        '%%endpoint%%',
                        'add_to_cart'
                    ),
                    data: { product_id },
                });

                jQuery(document.body).trigger('wc_fragment_refresh');
            }
        });
    });
});

async function handleVariableProduct(variationPicker: HTMLDivElement, product_id: string) {
    const variationSelects = variationPicker.querySelectorAll<HTMLSelectElement>("select");

    const options = Array.from(variationSelects).map((variationSelect) => {
        return {
            attribute: variationSelect.getAttribute("name")!,
            value: variationSelect.value
        };
    });

    if (window.wc) {
        await wp.data.dispatch(wc.wcBlocksData.cartStore)
            .addItemToCart(product_id, 1, options);

        return;
    }

    await window.wp.apiFetch({
        path: `/wc/store/v1/cart/add-item`,
        method: 'POST',
        data: {
            id: product_id,
            quantity: 1,
            variation: options
        }
    });

    jQuery(document.body).trigger('wc_fragment_refresh');
}