document.addEventListener("DOMContentLoaded", () => {
    const tabBlocks = document.querySelectorAll<HTMLElement>(".tab-block");

    tabBlocks.forEach((tabBlock) => {
        const activeBackground = tabBlock.dataset.activeBackgroundColor;
        const activeColor = tabBlock.dataset.activeColor;
        const inactiveBackground = tabBlock.dataset.backgroundColor;
        const inactiveColor = tabBlock.dataset.color;

        const tables = tabBlock.querySelectorAll<HTMLElement>(
            ".wp-block-tableberg-table",
        );
        const headings = tabBlock.querySelectorAll<HTMLElement>(".tab-heading");

        tables.forEach((table) => {
            table.style.display = "none";
        });

        headings.forEach((heading, index) => {
            heading.style.setProperty("color", inactiveColor ?? null);
            heading.style.setProperty(
                "background-color",
                inactiveBackground ?? null,
            );

            if (heading.classList.contains("active")) {
                tables[index].style.display = "block";
                heading.style.setProperty("color", activeColor ?? null);
                heading.style.setProperty(
                    "background-color",
                    activeBackground ?? null,
                );
            }

            heading.addEventListener("click", () => {
                tables.forEach((tab) => {
                    tab.style.display = "none";
                });

                tables[index].style.display = "block";

                headings.forEach((heading) => {
                    heading.classList.remove("active");
                    heading.style.setProperty("color", inactiveColor ?? null);
                    heading.style.setProperty(
                        "background-color",
                        inactiveBackground ?? null,
                    );
                });

                heading.classList.add("active");
                heading.style.setProperty("color", activeColor ?? null);
                heading.style.setProperty(
                    "background-color",
                    activeBackground ?? null,
                );
            });
        });
    });
});
