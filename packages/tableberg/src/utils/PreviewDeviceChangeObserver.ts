let lastDevice: any = null;

function register() {
    if (lastDevice) {
        return;
    }

    const previewEl = document.querySelector(
        ".is-tablet-preview, .is-desktop-preview, .is-mobile-preview",
    );
    if (!previewEl) {
        return;
    }
    lastDevice = previewEl.className.match(/is-(\w*)-preview/)?.[1];
    const previewObserver = new MutationObserver((mutationList: any) => {
        for (let mutation of mutationList) {
            if (mutation.attributeName === "class") {
                const currentPreview =
                    mutation.target.className.match(/is-(\w*)-preview/)[1];
                if (!currentPreview) {
                    return;
                }
                lastDevice = currentPreview;
                const event = new CustomEvent("TablebergPreviewDeviceChange", {
                    detail: {
                        currentPreview,
                    },
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

export const registerTablebergPreviewDeviceChangeObserver = register;
export const tablebergGetLastDevice = () => lastDevice;
