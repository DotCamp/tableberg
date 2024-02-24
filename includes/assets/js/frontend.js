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
            const subRow = parseInt(cell.dataset.tablebergCol);
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
        const oldMode = table.dataset.tablebergLast;
        if (oldMode === tag) {
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

        const cells = Array.from(table.querySelectorAll("th,td"));
        
        if (oldMode && oldMode.match("stack-row")) {
            cells.sort((a, b) => {
                const aRow = parseInt(a.dataset.tablebergRow);
                const bRow = parseInt(b.dataset.tablebergRow);
                const diff1 = aRow - bRow;
                if (diff1 !== 0) {
                    return diff1;
                }
                const aCol = parseInt(a.dataset.tablebergCol);
                const bCol = parseInt(b.dataset.tablebergCol);
                return aCol - bCol;
            });
        }

        const tbody = table.querySelector("tbody") || table;
        tbody.innerHTML = "";

        const headerArr = [];
        let stackRowCount = Math.max(count || 1, 1);

        let rowIdxStart = 0;
        let rowCount = -1,
            lastRow = -1,
            stackTrack = 0,
            lastRowEl;

        if (header) {
            stackRowCount++;
            rowCount++;
            lastRowEl = document.createElement("tr");
            tbody.appendChild(lastRowEl);
            stackTrack++;

            for (; rowIdxStart < cells.length; rowIdxStart++) {
                const cell = cells[rowIdxStart];
                if (cell.dataset.tablebergRow > 0) {
                    break;
                }
                lastRowEl.appendChild(cell);
                headerArr.push(cell);
            }
        }

        for (let idx = rowIdxStart; idx < cells.length; idx++) {
            const cell = cells[idx];

            if (lastRow != cell.dataset.tablebergRow) {
                lastRow = cell.dataset.tablebergRow;

                if (header && stackTrack == stackRowCount) {
                    rowCount++;

                    lastRowEl = document.createElement("tr");
                    lastRowEl.setAttribute("data-tableberg-tmp", "1");
                    tbody.appendChild(lastRowEl);

                    stackTrack = 1;

                    for (const cell of headerArr) {
                        lastRowEl.appendChild(cell.cloneNode(true));
                    }
                }

                rowCount++;
                lastRowEl = document.createElement("tr");
                tbody.appendChild(lastRowEl);
                stackTrack++;
            }

            lastRowEl.appendChild(cell);
        }
    }
})();
