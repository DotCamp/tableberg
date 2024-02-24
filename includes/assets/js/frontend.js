(() => {
    "use strict";
    document.addEventListener("DOMContentLoaded", () => {
        const tables = document.querySelectorAll("[data-tableberg-responsive]");
        if (tables.length) {
            window.addEventListener("resize", () => {
                tables.forEach(resizeTable);
            });
            tables.forEach(resizeTable);
        }
    });

    /**
     *
     * @param {HTMLTableElement} table
     */
    function resizeTable(table) {
        const opts = table.dataset;

        if (
            opts.tablebergMobileWidth &&
            window.innerWidth <= opts.tablebergMobileWidth
        ) {
            if (opts.tablebergMobileMode === "stack") {
                const renderMode =
                    "stack-" +
                    opts.tablebergMobileDirection +
                    "-" +
                    opts.tablebergMobileCount;
                if (opts.tablebergMobileDirection === "row") {
                    toRowStack(
                        table,
                        opts.tablebergMobileHeader,
                        opts.tablebergMobileCount,
                        renderMode
                    );
                } else {
                    toColStack(
                        table,
                        opts.tablebergMobileHeader,
                        opts.tablebergMobileCount,
                        renderMode
                    );
                }
            } else {
                //
            }
        } else if (
            opts.tablebergTabletWidth &&
            window.innerWidth <= opts.tablebergTabletWidth
        ) {
            if (opts.tablebergTabletMode === "stack") {
                const renderMode =
                    "stack-" +
                    opts.tablebergTabletDirection +
                    "-" +
                    opts.tablebergTabletCount;
                if (opts.tablebergTabletDirection === "row") {
                    toRowStack(
                        table,
                        opts.tablebergTabletHeader,
                        opts.tablebergTabletCount,
                        renderMode
                    );
                } else {
                    toColStack(
                        table,
                        opts.tablebergTabletHeader,
                        opts.tablebergTabletCount,
                        renderMode
                    );
                }
            } else {
                //
            }
        }
    }

    /**
     *
     * @param {HTMLTableElement} table
     * @param {boolean} header
     * @param {number} count
     * @param {string} tag
     */

    function toRowStack(table, header, count, tag) {
        if (table.dataset.tablebergLast === tag) {
            return;
        }
        table.setAttribute("data-tableberg-last", tag);
        table
            .querySelectorAll("[data-tableberg-tmp]")
            .forEach((el) => el.remove());

        const cells = table.querySelectorAll("th,td");

        const tbody = table.querySelector("tbody") || table;
        tbody.innerHTML = "";

        const masterRowMap = new Map();

        const headerArr = [];
        let colCount = Math.max(count || 1, 1);

        const cols = parseInt(table.dataset.tablebergCols);
        if (header) {
            colCount++;
            for (const cell of cells) {
                if (cell.dataset.tablebergRow > 0) {
                    break;
                }
                headerArr.push(cell);
            }
        }

        let rowCount = 0;
        for (const cell of cells) {

            const subRow = cell.dataset.tablebergCol;
            const masterRow = masterRowMap.get(subRow);

            if (!masterRow) {
                const rowEl = document.createElement("tr");
                masterRowMap.set(subRow, {
                    lastRow: rowCount,
                    count: 1,
                    lastRowEL: rowEl,
                });
                rowEl.appendChild(cell);
                tbody.appendChild(rowEl);
                rowCount++;
            } else if (masterRow.count == colCount) {
                const rowEl = document.createElement("tr");
                tbody.appendChild(rowEl);

                let thisRowColCount = 1;
                if (header) {
                    const headerCell = headerArr[subRow].cloneNode(true);
                    headerCell.setAttribute("data-tableberg-tmp", "1");
                    rowEl.appendChild(headerCell);
                    thisRowColCount++;
                }
                masterRowMap.set(subRow, {
                    lastRow: rowCount,
                    count: thisRowColCount,
                    lastRowEL: rowEl,
                });

                rowEl.appendChild(cell);

                if (rowCount % cols === 0) {
                    rowEl.style.borderTop = "5px dashed gray";
                }
                rowCount++;
            } else {
                masterRow.count++;
                masterRow.lastRowEL.appendChild(cell);
            }
        }
    }

    /**
     *
     * @param {HTMLTableElement} table
     * @param {boolean} header
     * @param {number} count
     * @param {string} tag
     */

    function toColStack(table, header, count, tag) {
        if (table.dataset.tablebergLast === tag) {
            return;
        }
        table.setAttribute("data-tableberg-last", tag);
        if (!header) {
            return;
        }
        count = parseInt(count);

        table
            .querySelectorAll("[data-tableberg-tmp]")
            .forEach((el) => el.remove());

        const trs = table.querySelectorAll("tr");

        for (let i = count; i < trs.length; i += count) {
            const before = trs[i + 1];
            if (!before) {
                return;
            }
            const header = trs[0].cloneNode(true);
            before.parentElement.insertBefore(header, before);
            header.setAttribute("data-tableberg-tmp", "1");
        }
    }
})();
