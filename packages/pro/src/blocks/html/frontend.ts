document.addEventListener("DOMContentLoaded", () => {
    const all = document.querySelectorAll(".tableberg-custom-html");

    all.forEach((el) => {
        const templateContent = (el.nextElementSibling as HTMLTemplateElement)
            .content;
        const iframe = document.createElement("iframe");
        el.appendChild(iframe);

        const iframeDoc =
            iframe.contentDocument || iframe.contentWindow!.document;

        const styles = `
            html,body,:root {
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                min-height: auto !important;
            }
        `;

        const hasDoctype = templateContent.querySelector("html");
        if (hasDoctype) {
            iframeDoc.open();
            iframeDoc.write(
                new XMLSerializer().serializeToString(templateContent),
            );
            iframeDoc.close();
        } else {
            iframeDoc.open();
            iframeDoc.write(
                `<!DOCTYPE html>
                <html>
                    <head>
                        <title>iFrame Content</title>
                        <style>${styles}</style>
                    </head>
                    <body></body>
                </html>`,
            );
            iframeDoc.close();
            iframeDoc.body.appendChild(templateContent);
        }
        el.nextElementSibling?.remove();
        const wrapper = iframeDoc.createElement("div");
        wrapper.style.width = "max-content";
        wrapper.style.overflow = "hidden";

        Array.from(iframeDoc.body.children).forEach((element) => {
            wrapper.appendChild(element);
        });
        iframeDoc.body.appendChild(wrapper);

        const resizeIframe = () => {
            const size =
                iframeDoc.body.firstElementChild!.getBoundingClientRect();
            iframe.style.height = size.height + "px";
            iframe.style.width = size.width + "px";
        };

        iframe.addEventListener("load", resizeIframe);
        const observer = new MutationObserver(resizeIframe);
        observer.observe(iframeDoc.body.firstElementChild!, {
            childList: true,
            subtree: true,
        });

        iframe.style.display = "block";
        iframe.style.border = "none";

        resizeIframe();
    });
});
