(() => {
    let lastDevice = null;

    function register() {
        if (lastDevice) {
            return;
        }

        const previewEl = document.querySelector(
            ".is-tablet-preview, .is-desktop-preview, .is-mobile-preview"
        );
        lastDevice = previewEl.className.match(/is-(\w*)-preview/)[1];
        const previewObserver = new MutationObserver((mutationList) => {
            console.log(mutationList);
            for (let mutation of mutationList) {
                if (mutation.attributeName === "class") {
                    const currentPreview =
                        mutation.target.className.match(/is-(\w*)-preview/)[1];
                        console.log("In:", currentPreview);
                    if (!currentPreview) {
                        return;
                    }
                    lastDevice = currentPreview;
                    const event = new CustomEvent("TablebergPreviewDeviceChange", {
                        detail: {
                            currentPreview
                        }
                    });
                    document.dispatchEvent(event);
                    return;
                }
            }
        });

        previewObserver.observe(previewEl, {
            attributes: true,
            attributeFilter: ["class"],
            attributeOldValue: true,
        });
    }

    window.registerTablebergPreviewDeviceChangeObserver = register;
    window.tablebergGetLastDevice = () => lastDevice;
})();
