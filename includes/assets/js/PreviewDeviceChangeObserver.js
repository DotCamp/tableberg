let tablebergPreviewDeviceMutationObserverRegistered = false;

function registerTablebergPreviewDeviceChangeObserver() {
    if (tablebergPreviewDeviceMutationObserverRegistered) {
        return;
    }

    const previewEl = document.querySelector(
        ".is-tablet-preview, .is-desktop-preview, .is-mobile-preview"
    );

    const previewObserver = new MutationObserver((mutationList) => {
        for (let mutation of mutationList) {
            if (mutation.attributeName === "class") {
                const currentPreview = mutation.target.className.match(/is-(\w*)-preview/)[1];
                if (!currentPreview) {
                    return
                }

                const event = new CustomEvent("TablebergPreviewDeviceChange", {
                    detail: {
                        currentPreview
                    }
                });
                document.dispatchEvent(event);
                return
            }
        }
    });

    previewObserver.observe(previewEl, {
        attributes: true,
        attributeFilter: ["class"],
        attributeOldValue: true
    });

    tablebergPreviewDeviceMutationObserverRegistered = true;
}
