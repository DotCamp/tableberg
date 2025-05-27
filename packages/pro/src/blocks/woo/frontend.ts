document.addEventListener("DOMContentLoaded", () => {
    const wooCartButtons = document.querySelectorAll<HTMLElement>(
        ".wp-block-tableberg-button[data-tableberg-woo-product-id]"
    );

    wooCartButtons.forEach((wooCartButton) => {
        wooCartButton.addEventListener("click", async () => {
            const product_id = wooCartButton.dataset.tablebergWooProductId;

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