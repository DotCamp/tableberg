document.addEventListener("DOMContentLoaded", () => {
    const tabBlocks = document.querySelectorAll(".tab-block");

    tabBlocks.forEach((tabBlock) => {
        const tables = tabBlock.querySelectorAll(
            ".wp-block-tableberg-table",
        ) as NodeListOf<HTMLElement>;
        const headings = tabBlock.querySelectorAll(".tab-heading");

        tables.forEach((table) => {
            table.style.display = "none";
        });

        headings.forEach((heading, index) => {
            if (heading.classList.contains("active")) {
                tables[index].style.display = "block";
            }
        });

        headings.forEach((heading, index) => {
            heading.addEventListener("click", () => {
                tables.forEach((tab) => {
                    tab.style.display = "none";
                });

                tables[index].style.display = "block";

                headings.forEach((heading) => {
                    heading.classList.remove("active");
                });
                heading.classList.add("active");
            });
        });
    });
});
