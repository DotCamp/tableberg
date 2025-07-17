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

        const searchBoxes = document.querySelectorAll(
            "[data-tableberg-search]",
        );

        if (searchBoxes.length) {
            searchBoxes.forEach((searchBox) => {
                searchBox.addEventListener("input", () => {
                    searchTable(searchBox);
                });
            });
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
                        renderMode,
                    );
                } else {
                    toColStack(
                        table,
                        opts.tablebergMobileHeader,
                        opts.tablebergMobileCount,
                        renderMode,
                    );
                }
            } else if (opts.tablebergMobileMode === "scroll") {
                toScrollTable(table);
            } else {
                reviveTable(table);
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
                        renderMode,
                    );
                } else {
                    toColStack(
                        table,
                        opts.tablebergTabletHeader,
                        opts.tablebergTabletCount,
                        renderMode,
                    );
                }
            } else if (opts.tablebergTabletMode === "scroll") {
                toScrollTable(table);
            } else {
                reviveTable(table);
            }
        } else {
            reviveTable(table);
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
        reviveTable(table);
        setTableClassName(table, "tableberg-rowstack-table");
        table.setAttribute("data-tableberg-last", tag);
        const colGroup = table.querySelector("colgroup");
        if (colGroup) {
            colGroup.style.display = "none";
        }

        const cells = table.querySelectorAll("th,td");

        const tbody = table.querySelector("tbody") || table;
        tbody.innerHTML = "";

        const masterRowMap = new Map();

        const headerArr = [];
        let colCount = Math.max(count || 1, 1);

        const cols = parseInt(table.dataset.tablebergCols);

        if (table.dataset.tablebergHeader) {
            for (const cell of cells) {
                if (cell.dataset.tablebergRow > 0) {
                    break;
                }
                markRowCell(cell, "header");
            }
        }

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

            let row = parseInt(cell.dataset.tablebergRow);
            if (table.dataset.tablebergHeader && row > 0) {
                row++;
            }

            if (
                table.dataset.tablebergFooter &&
                ((table.dataset.tablebergHeader &&
                    row == table.dataset.tablebergRows) ||
                    (!table.dataset.tablebergHeader &&
                        row + 1 == table.dataset.tablebergRows))
            ) {
                markRowCell(cell, "footer");
            } else if (row > 0) {
                if (row % 2) {
                    markRowCell(cell, "even-row");
                } else {
                    markRowCell(cell, "odd-row");
                }
            }

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
                    rowEl.style.borderTop = "3px solid gray";
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
     * @param {boolean} headerAsCol
     * @param {number} stackCount
     * @param {string} tag
     */

    function toColStack(table, headerAsCol, stackCount, tag) {
        const oldMode = table.dataset.tablebergLast;
        if (oldMode === tag) {
            return;
        }
        reviveTable(table);

        table.setAttribute("data-tableberg-last", tag);

        setTableClassName(table, "tableberg-colstack-table");

        let cells = Array.from(table.querySelectorAll("th,td"));

        if (oldMode && oldMode.match("stack-row")) {
            cells.sort((a, b) => {
                const {
                    dataset: { tablebergRow: aRow, tablebergCol: aCol },
                } = a;
                const {
                    dataset: { tablebergRow: bRow, tablebergCol: bCol },
                } = b;

                return aRow === bRow
                    ? parseInt(aCol) - parseInt(bCol)
                    : parseInt(aRow) - parseInt(bRow);
            });
        }

        const tbody = table.querySelector("tbody") || table;
        tbody.innerHTML = "";

        stackCount = Math.max(parseInt(stackCount) || 1, 1);

        const tableCols = parseInt(table.dataset.tablebergCols);
        const tableRows = parseInt(table.dataset.tablebergRows);

        const cols = headerAsCol ? tableCols - 1 : tableCols;
        const rowsToGenerate = tableRows * Math.ceil(cols / stackCount);

        let tableMarkup = "";
        const rowMarkups = Array.from({ length: rowsToGenerate }, () => "");

        function markCell(cell) {
            const rowi = parseInt(cell.dataset.tablebergRow);
            if (
                table.dataset.tablebergHeader !== "" &&
                cell.dataset.tablebergRow === "0"
            ) {
                markRowCell(cell, "header");
            } else if (
                table.dataset.tablebergFooter !== "" &&
                rowi === parseInt(table.dataset.tablebergRows) - 1
            ) {
                markRowCell(cell, "footer");
            } else if (rowi % 2 === 0) {
                markRowCell(cell, "even-row");
            } else if (rowi % 2 !== 0) {
                markRowCell(cell, "odd-row");
            }
        }

        (function addLeftColToEachStack() {
            if (!headerAsCol) {
                return;
            }

            const leftColCells = cells.filter(
                (cell) => parseInt(cell.dataset.tablebergCol) === 0,
            );
            const cellsExcludingLeftCol = cells.filter(
                (cell) => parseInt(cell.dataset.tablebergCol) !== 0,
            );

            const leftColCellsWithGapsForRowspan = [];
            leftColCells.forEach((cell) => {
                leftColCellsWithGapsForRowspan.push(cell);
                if (cell.attributes.rowspan) {
                    for (
                        let i = 1;
                        i < parseInt(cell.attributes.rowspan.value);
                        i++
                    ) {
                        leftColCellsWithGapsForRowspan.push("gap");
                    }
                }
            });

            cells = cellsExcludingLeftCol;

            for (let row = 0; row < rowsToGenerate; row++) {
                const cell = leftColCellsWithGapsForRowspan[row % tableRows];
                if (cell === "gap") {
                    continue;
                }

                if (row > tableRows - 1) {
                    cell.setAttribute("data-tableberg-tmp", "1");
                }

                markCell(cell);
                rowMarkups[row] += cell.outerHTML;
            }
        })();

        (function generateCellMarkup() {
            for (const cell of cells) {
                const coli = headerAsCol
                    ? parseInt(cell.dataset.tablebergCol) - 1
                    : parseInt(cell.dataset.tablebergCol);
                const rowi = parseInt(cell.dataset.tablebergRow);

                let targetRow =
                    tableRows * (Math.ceil((coli + 1) / stackCount) - 1) + rowi;

                markCell(cell);

                rowMarkups[targetRow] += cell.outerHTML;
            }
        })();

        (function generateRows() {
            for (let i = 0; i < rowsToGenerate; i++) {
                const createRow = (rowClass = "row") => `<tr
                    className=tableberg-${rowClass}
                >
                    ${rowMarkups[i]}
                </tr>`;

                const isHeaderRow = i % tableRows === 0;
                const isFooterRow = i % tableRows === tableRows - 1;

                if (table.dataset.tablebergHeader !== "" && isHeaderRow) {
                    tableMarkup += createRow("header");
                } else if (
                    table.dataset.tablebergFooter !== "" &&
                    isFooterRow
                ) {
                    tableMarkup += createRow("footer");
                } else if (i % 2 === 0) {
                    tableMarkup += createRow("even-row");
                } else if (i % 2 !== 0) {
                    tableMarkup += createRow("odd-row");
                }
            }
        })();

        const colGroup = table.querySelector("colgroup");
        if (colGroup) {
            colGroup.remove();
        }

        tbody.innerHTML = tableMarkup;
    }

    /**
     *
     * @param {HTMLTableElement} table
     * @returns
     */

    function reviveTable(table) {
        const oldMode = table.dataset.tablebergLast;
        if (!oldMode) {
            return;
        }
        table.removeAttribute("data-tableberg-last");
        table.parentElement.classList.remove("tableberg-scroll-x");

        table
            .querySelectorAll("[data-tableberg-tmp]")
            .forEach((el) => el.remove());

        if (!oldMode || !oldMode.match("stack")) {
            return;
        }

        setTableClassName(table);

        const colGroup = table.querySelector("colgroup");
        if (colGroup) {
            colGroup.removeAttribute("style");
        }

        const cells = Array.from(table.querySelectorAll("th,td"));
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

        const tbody = table.querySelector("tbody") || table;
        tbody.innerHTML = "";

        let lastRow = -1,
            lastRowEl;

        for (const cell of cells) {
            if (lastRow != cell.dataset.tablebergRow) {
                lastRow = cell.dataset.tablebergRow;
                lastRowEl = document.createElement("tr");

                let row = parseInt(lastRow);
                if (table.dataset.tablebergHeader) {
                    if (row === 0) {
                        markRow(lastRowEl, "header");
                    } else {
                        row++;
                    }
                }

                if (
                    table.dataset.tablebergFooter &&
                    row == table.dataset.tablebergRows
                ) {
                    markRow(lastRowEl, "footer");
                } else if (row > 0) {
                    if (row % 2) {
                        markRow(lastRowEl, "even-row");
                    } else {
                        markRow(lastRowEl, "odd-row");
                    }
                }

                tbody.appendChild(lastRowEl);
            }

            lastRowEl.appendChild(cell);
        }
    }

    function toScrollTable(table) {
        const opts = table.dataset;
        if (opts.tablebergLast === "scroll") {
            return;
        }
        if (opts.tablebergLast) {
            reviveTable(table);
        }
        table.setAttribute("data-tableberg-last", "scroll");
        table.parentElement.classList.add("tableberg-scroll-x");
    }

    /**
     *
     * @param {HTMLTableCellElement} cell
     * @param {"even-row" | "odd-row" | "header" | "footer"} oddEven
     */

    function markRowCell(cell, oddEven) {
        [
            "tableberg-even-row-cell",
            "tableberg-header-cell",
            "tableberg-footer-cell",
            "tableberg-odd-row-cell",
        ].forEach((className) => cell.classList.remove(className));
        cell.classList.add(`tableberg-${oddEven}-cell`);
    }

    /**
     *
     * @param {HTMLTableRowElement} row
     * @param {"even-row" | "odd-row" | "header" | "footer"} oddEven
     */

    function markRow(row, oddEven) {
        [
            "tableberg-even-row",
            "tableberg-header",
            "tableberg-footer",
            "tableberg-odd-row",
        ].forEach((className) => row.classList.remove(className));
        row.classList.add(`tableberg-${oddEven}`);
    }

    /**
     *
     * @param {HTMLTableElement} table
     * @param {string} className
     */
    function setTableClassName(table, className) {
        ["tableberg-rowstack-table", "tableberg-rowstack-table"].forEach(
            (className) => table.classList.remove(className),
        );
        className && table.classList.add(className);
    }

    function searchTable(input) {
        const search = input.value.trim();
        const rows = input.parentElement.parentElement.querySelectorAll("tr");

        removeHighlights();

        if (!search) {
            if (input.dataset.isDirty) {
                input.dataset.isDirty = false;
                Array.from(rows).forEach((row) => {
                    row.style.display = "table-row";
                });
            }
            return;
        }
        Array.from(rows).forEach((row) => {
            if (
                row.querySelectorAll("th").length > 1 ||
                row.textContent?.toLowerCase().includes(search.toLowerCase())
            ) {
                row.style.display = "table-row";
                highlightMatches(row, search);
            } else {
                row.style.display = "none";
            }
        });
        input.dataset.isDirty = true;
    }

    function highlightMatches(row, searchTerm) {
        const cells = row.querySelectorAll("td, th");
        cells.forEach((cell) => {
            const text = cell.textContent;
            if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
                const regex = new RegExp(
                    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                    "gi",
                );
                cell.innerHTML = text.replace(
                    regex,
                    '<span class="tableberg-search-highlight">$1</span>',
                );
            }
        });
    }

    function removeHighlights() {
        const highlights = document.querySelectorAll(
            ".tableberg-search-highlight",
        );
        highlights.forEach((highlight) => {
            const parent = highlight.parentNode;
            parent.replaceChild(
                document.createTextNode(highlight.textContent),
                highlight,
            );
        });
    }

    const vSortBtns = document.querySelectorAll(".tableberg-v-sorter");

    vSortBtns.forEach((btn) => {
        btn.addEventListener("click", vSortTable);
    });

    const hSortBtns = document.querySelectorAll(".tableberg-h-sorter");

    hSortBtns.forEach((btn) => {
        btn.addEventListener("click", hSortTable);
    });

    /**
     *
     * @param {HTMLTableRowElement} row
     * @param {number} colIndex
     * @returns
     */
    function getCellValue(row, colIndex) {
        let cellIndex = 0;
        for (let cell of row.cells) {
            if (cellIndex === colIndex)
                return cell.textContent.trim().toLowerCase();
            cellIndex += cell.colSpan;
        }
        return "";
    }

    function vSortTable() {
        const table = this.closest("table");
        const byCol = parseInt(this.parentElement.dataset.tablebergCol);
        if (!table) return;

        const rows = Array.from(table.tBodies[0].rows);
        const indexedRows = rows.map((row, index) => ({
            originalIndex: index,
            content: getCellValue(row, byCol),
        }));

        let carry = 0;

        if (table.dataset.tablebergHeader) {
            indexedRows.splice(0, 1);
            carry = 1;
        }

        if (table.dataset.tablebergFooter) {
            indexedRows.pop();
        }
        const newOrder =
            table.dataset.vSortedBy == byCol && table.dataset.vOrder === "asc"
                ? "desc"
                : "asc";

        if (newOrder === "asc") {
            indexedRows.sort((a, b) =>
                a.content.localeCompare(b.content, undefined, {
                    numeric: true,
                }),
            );
        } else {
            indexedRows.sort((a, b) =>
                b.content.localeCompare(a.content, undefined, {
                    numeric: true,
                }),
            );
        }

        const indexMap = {};

        indexedRows.forEach((item, newIndex) => {
            indexMap[newIndex + carry] = item.originalIndex;
        });

        const sortedRows = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[indexMap[i] || i];
            sortedRows.push(row);
            for (const cell of row.cells) {
                cell.dataset.tablebergRow = i;
            }
        }

        const tbody = table.tBodies[0];
        sortedRows.forEach((row) => tbody.appendChild(row));

        table.dataset.vSortedBy = byCol;
        table.dataset.vOrder = newOrder;

        this.closest("tr")
            .querySelectorAll(".tableberg-v-sorter")
            .forEach((btn) => {
                btn.remove();
            });

        let index = 0;
        for (const cell of tbody.rows[0].cells) {
            const btn = document.createElement("button");
            btn.classList.add("tableberg-v-sorter");
            if (index === byCol) {
                btn.classList.add(`tableberg-${newOrder}`);
            }
            btn.addEventListener("click", vSortTable);
            cell.appendChild(btn);
            index++;
        }
    }

    function hSortTable() {
        const table = this.closest("table");
        const byRow = parseInt(this.parentElement.dataset.tablebergRow);
        if (!table) return;

        const cols = Array.from(table.tBodies[0].rows[byRow].cells);
        const indexedCols = [];

        let lastIdx = 0;
        cols.forEach((col) => {
            indexedCols.push({
                originalIndex: lastIdx++,
                content: col.textContent.trim().toLowerCase(),
            });

            for (let i = 1; i < col.colSpan; i++) {
                indexedCols.push({
                    originalIndex: lastIdx++,
                    content: "",
                });
            }
        });

        const newOrder =
            table.dataset.hSortedBy == byRow && table.dataset.hOrder === "asc"
                ? "desc"
                : "asc";

        if (newOrder === "asc") {
            indexedCols.sort((a, b) => {
                if (a.content < b.content) return -1;
                if (a.content > b.content) return 1;
                return 0;
            });
        } else {
            indexedCols.sort((a, b) => {
                if (a.content < b.content) return 1;
                if (a.content > b.content) return -1;
                return 0;
            });
        }

        const indexMap = {};

        indexedCols.forEach((item, newIndex) => {
            indexMap[item.originalIndex] = newIndex;
        });

        const tbody = table.tBodies[0];

        table.dataset.hSortedBy = byRow;
        table.dataset.hOrder = newOrder;

        table.querySelectorAll(".tableberg-h-sorter").forEach((btn) => {
            btn.remove();
        });

        let index = 0;
        for (const row of tbody.rows) {
            const sortedCells = [];
            for (const cell of row.cells) {
                const idx = indexMap[cell.dataset.tablebergCol];
                sortedCells[idx] = cell;
                cell.dataset.tablebergCol = idx;
            }

            sortedCells.forEach((cell) => cell && row.appendChild(cell));

            const cell = sortedCells[0];
            const btn = document.createElement("button");
            btn.classList.add("tableberg-h-sorter");
            if (index === byRow) {
                btn.classList.add(`tableberg-${newOrder}`);
            }
            btn.addEventListener("click", hSortTable);
            cell.appendChild(btn);
            index++;
        }
    }
})();
