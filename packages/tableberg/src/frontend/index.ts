import "../style.scss";
import "../cell/style.scss";
import "../image/style.scss";
import "../button/style.scss";

type OddEven = "even-row" | "odd-row" | "header" | "footer";

document.addEventListener("DOMContentLoaded", () => {
    const tables = document.querySelectorAll("[data-tableberg-responsive]");
    if (tables.length) {
        window.addEventListener("resize", () => {
            tables.forEach(resizeTable as any);
        });
        tables.forEach(resizeTable as any);
    }
});

/**
 *
 * @param {HTMLTableElement} table
 */
function resizeTable(table: HTMLTableElement) {
    const opts = table.dataset as any;

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

function toRowStack(
    table: HTMLTableElement,
    header: boolean,
    count: number,
    tag: string,
) {
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

    const cells = table.querySelectorAll("th,td") as any;

    const tbody = table.querySelector("tbody") || table;
    tbody.innerHTML = "";

    const masterRowMap = new Map();

    const headerArr = [];
    let colCount = Math.max(count || 1, 1);

    const cols = parseInt(table.dataset.tablebergCols as any);

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
                row == (table.dataset.tablebergRows as any)) ||
                (!table.dataset.tablebergHeader &&
                    row + 1 == (table.dataset.tablebergRows as any)))
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
 * @param {boolean} header
 * @param {number} count
 * @param {string} tag
 */

function toColStack(
    table: HTMLTableElement,
    header: boolean,
    count: number,
    tag: string,
) {
    const oldMode = table.dataset.tablebergLast;
    if (oldMode === tag) {
        return;
    }
    if (!header) {
        return;
    }
    count = parseInt(count as any);
    reviveTable(table);

    table.setAttribute("data-tableberg-last", tag);

    setTableClassName(table, "tableberg-colstack-table");

    const cells = Array.from(
        table.querySelectorAll("th,td"),
    ) as HTMLTableCellElement[];

    if (oldMode && oldMode.match("stack-row")) {
        cells.sort((a, b) => {
            const aRow = parseInt(a.dataset.tablebergRow!);
            const bRow = parseInt(b.dataset.tablebergRow!);
            const diff1 = aRow - bRow;
            if (diff1 !== 0) {
                return diff1;
            }
            const aCol = parseInt(a.dataset.tablebergCol!);
            const bCol = parseInt(b.dataset.tablebergCol!);
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
        lastRowEl: any;

    if (header) {
        stackRowCount++;
        rowCount++;
        lastRowEl = document.createElement("tr");
        markRow(lastRowEl, "header");
        tbody.appendChild(lastRowEl);
        stackTrack++;

        for (; rowIdxStart < cells.length; rowIdxStart++) {
            const cell = cells[rowIdxStart];
            if ((cell.dataset.tablebergRow as any) > 0) {
                break;
            }
            lastRowEl.appendChild(cell);
            headerArr.push(cell);
        }
    }

    const footer = table.dataset.tablebergFooter;
    const footerArr = [];

    if (footer) {
        const fRow = parseInt(table.dataset.tablebergRows!) - 1;
        let i = cells.length - 1;
        for (; i > -1; i--) {
            if ((cells[i].dataset.tablebergRow as any) < fRow) {
                break;
            }
            footerArr.unshift(cells[i]);
        }
        cells.splice(i + 1);
    }

    for (let idx = rowIdxStart; idx < cells.length; idx++) {
        const cell = cells[idx];

        if (lastRow != (cell.dataset.tablebergRow as any)) {
            lastRow = cell.dataset.tablebergRow as any;

            let row = parseInt(lastRow as any);

            if (header) {
                row++;
                if (stackTrack == stackRowCount) {
                    rowCount++;

                    lastRowEl = document.createElement("tr");
                    markRow(lastRowEl, "header");
                    lastRowEl.setAttribute("data-tableberg-tmp", "1");
                    tbody.appendChild(lastRowEl);

                    stackTrack = 1;

                    for (const cell of headerArr) {
                        lastRowEl.appendChild(cell.cloneNode(true));
                    }
                }
            }
            rowCount++;
            lastRowEl = document.createElement("tr");

            if (row % 2) {
                markRow(lastRowEl, "even-row");
            } else {
                markRow(lastRowEl, "odd-row");
            }
            tbody.appendChild(lastRowEl);
            stackTrack++;
        }

        lastRowEl.appendChild(cell);
    }

    if (footerArr.length > 0) {
        lastRowEl = document.createElement("tr");
        markRow(lastRowEl, "footer");
        tbody.appendChild(lastRowEl);

        footerArr.forEach((cell) => lastRowEl.appendChild(cell));
    }
}

/**
 *
 * @param {HTMLTableElement} table
 * @returns
 */

function reviveTable(table: HTMLTableElement) {
    const oldMode = table.dataset.tablebergLast;
    if (!oldMode) {
        return;
    }
    table.removeAttribute("data-tableberg-last");
    table.parentElement?.classList.remove("tableberg-scroll-x");

    table
        .querySelectorAll("[data-tableberg-tmp]")
        .forEach((el: Element) => el.remove());

    if (!oldMode || !oldMode.match("stack")) {
        return;
    }

    setTableClassName(table);

    const colGroup = table.querySelector("colgroup");
    if (colGroup) {
        colGroup.removeAttribute("style");
    }

    const cells = Array.from(
        table.querySelectorAll("th,td"),
    ) as HTMLTableCellElement[];
    cells.sort((a, b) => {
        const aRow = parseInt(a.dataset.tablebergRow!);
        const bRow = parseInt(b.dataset.tablebergRow!);
        const diff1 = aRow - bRow;
        if (diff1 !== 0) {
            return diff1;
        }
        const aCol = parseInt(a.dataset.tablebergCol!);
        const bCol = parseInt(b.dataset.tablebergCol!);
        return aCol - bCol;
    });

    const tbody = table.querySelector("tbody") || table;
    tbody.innerHTML = "";

    let lastRow = -1,
        lastRowEl;

    for (const cell of cells) {
        if (lastRow != (cell.dataset.tablebergRow as any)) {
            lastRow = cell.dataset.tablebergRow as any;
            lastRowEl = document.createElement("tr");

            let row = parseInt(lastRow as any);
            if (table.dataset.tablebergHeader) {
                if (row === 0) {
                    markRow(lastRowEl, "header");
                } else {
                    row++;
                }
            }

            if (
                table.dataset.tablebergFooter &&
                row == (table.dataset.tablebergRows as any)
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

        lastRowEl!.appendChild(cell);
    }
}

function toScrollTable(table: HTMLTableElement) {
    const opts = table.dataset;
    if (opts.tablebergLast === "scroll") {
        return;
    }
    if (opts.tablebergLast) {
        reviveTable(table);
    }
    table.setAttribute("data-tableberg-last", "scroll");
    table.parentElement?.classList.add("tableberg-scroll-x");
}

/**
 *
 * @param {HTMLTableCellElement} cell
 * @param {"even-row" | "odd-row" | "header" | "footer"} oddEven
 */

function markRowCell(cell: HTMLTableCellElement, oddEven: OddEven) {
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

function markRow(row: HTMLTableRowElement, oddEven: OddEven) {
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
function setTableClassName(table: HTMLTableElement, className?: string) {
    ["tableberg-rowstack-table", "tableberg-rowstack-table"].forEach(
        (className) => table.classList.remove(className),
    );
    className && table.classList.add(className);
}
