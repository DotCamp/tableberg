document.addEventListener("DOMContentLoaded", () => {
    const wooCartButtons = document.querySelectorAll<HTMLElement>(
        ".wp-block-tableberg-button[data-tableberg-woo-product-id]"
    );

    wooCartButtons.forEach((wooCartButton) => {
        wooCartButton.addEventListener("click", async () => {
            const productId = wooCartButton.dataset.tablebergWooProductId;

            await wp.data.dispatch(wc.wcBlocksData.cartStore).addItemToCart(productId, 1);
        });
    });
});