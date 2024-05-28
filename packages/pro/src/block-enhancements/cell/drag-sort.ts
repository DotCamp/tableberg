import {
    TablebergBlockAttrs,
    TablebergCellInstance,
} from "@tableberg/shared/types";
import { BlockInstance, cloneBlock } from "@wordpress/blocks";

const CONTEXT_MAP = new Map<string, Context>();
const HAS_TOUCH: boolean =
    "ontouchstart" in window || (navigator.maxTouchPoints as any);

let ctxLen = 1;

interface Position {
    x: number;
    y: number;
}

class Context {
    public isActive: boolean = false;
    public type?: "row" | "col";
    public activeEls?: HTMLTableCellElement[];
    public overInstance?: DragNDropSorting;

    public rootEl: HTMLDivElement;

    public startInstance?: DragNDropSorting;
    public startPos?: Position;
    public startBox?: DOMRect;

    public dragPreview?: HTMLDivElement;

    public cellInstances: DragNDropSorting[] = [];

    constructor(rootEl: HTMLDivElement) {
        this.rootEl = rootEl;
    }
}

export class DragNDropSorting {
    public cellEl: HTMLTableCellElement;
    private ctx: Context;

    private row: number;
    private col: number;
    private rowspan: number;
    private colspan: number;

    private onMouseMoveFn = (evt: MouseEvent) => this.mouseMove(evt);
    private onTouchMoveFn = (evt: TouchEvent) => this.touchMove(evt);
    private cleanUpEvt = () => this.cleanUp();

    private startEvt: (evt: MouseEvent | TouchEvent) => void;
    private touchEvt?: (evt: TouchEvent) => void;
    private overEvt = () => this.onOver();
    private dropEvt = () => this.onDrop();
    private leaveEvt = () => this.onLeave();

    private makeMove: (ctx: Context) => void;

    constructor(
        cellEL: HTMLTableCellElement,
        row: number,
        col: number,
        rowspan: number,
        colspan: number,
        makeMove: (ctx: Context) => void,
    ) {
        this.cellEl = cellEL;

        this.row = row;
        this.col = col;
        this.rowspan = rowspan;
        this.colspan = colspan;
        this.makeMove = makeMove;

        const root = cellEL.closest("div")!;
        if (!root.dataset.__tableberg_drag_ctx) {
            root.dataset.__tableberg_drag_ctx = `${ctxLen++}`;
            this.ctx = new Context(root);
            CONTEXT_MAP.set(root.dataset.__tableberg_drag_ctx, this.ctx);
        } else {
            this.ctx = CONTEXT_MAP.get(root.dataset.__tableberg_drag_ctx)!;
        }

        this.ctx.cellInstances.push(this);

        this.startEvt = (evt: MouseEvent | TouchEvent) => {
            /**
             * Prevent default behavior of the browser when clicked
             * sometimes touchstart is not cancellable (i.e. when scrolling)
             */
            if (!evt.cancelable || !evt.ctrlKey) {
                return;
            }
            evt.preventDefault();
            evt.stopImmediatePropagation();

            this.ctx.isActive = true;
            this.ctx.overInstance = this;
            this.ctx.startInstance = this;

            this.ctx.dragPreview = document.createElement("div");
            this.ctx.dragPreview.classList.add("tableberg-drag-preview");
            this.ctx.startBox = this.cellEl.getBoundingClientRect();

            // TODO: Make the preview appear as selected

            document.body.appendChild(this.ctx.dragPreview);

            // TODO: set the active els & add their class

            document.addEventListener("mousemove", this.onMouseMoveFn);
            document.addEventListener("mouseup", this.cleanUpEvt);
            if (HAS_TOUCH) {
                document.addEventListener("touchmove", this.onTouchMoveFn);
                document.addEventListener("touchend", this.cleanUpEvt);
            }

            let posX, posY;

            if ("x" in evt && "y" in evt) {
                posX = evt.x;
                posY = evt.y;
            } else {
                posX = evt.touches[0].clientX;
                posY = evt.touches[0].clientY;
            }
            this.ctx.startPos = {
                x: posX,
                y: posY,
            };
        };

        cellEL.addEventListener("mousedown", this.startEvt);

        if (HAS_TOUCH) {
            this.touchEvt = (evt: TouchEvent) => {
                /**
                 * Only start dragging if there's one touch
                 * two or more are for zoom/pinch or other actions
                 * we don't want to mess with
                 */
                if (evt.touches.length !== 1) {
                    return;
                }
                this.startEvt(evt);
            };
            cellEL.addEventListener("touchstart", this.touchEvt);
        }

        cellEL.addEventListener("mouseenter", this.overEvt);
        cellEL.addEventListener("mouseleave", this.leaveEvt);
        cellEL.addEventListener("mouseup", this.dropEvt);
    }

    private mouseMove(evt: Event & Position) {
        evt.preventDefault();
        evt.stopImmediatePropagation();

        const oldType = this.ctx.type;

        if (
            Math.abs(evt.x - this.ctx.startPos!.x) <
            Math.abs(evt.y - this.ctx.startPos!.y)
        ) {
            this.ctx.type = "row";
        } else {
            this.ctx.type = "col";
        }

        const rootBox = this.ctx.rootEl.getBoundingClientRect();

        if (oldType !== this.ctx.type) {
            this.ctx.activeEls?.forEach((el) => {
                el.classList.remove("tableberg-drag-active-" + oldType);
            });
            this.ctx.activeEls = [];
            if (this.ctx.type === "col") {
                this.ctx.dragPreview!.style.height = `${rootBox.height}px`;
                this.ctx.dragPreview!.style.width = `${
                    this.ctx.startBox!.width
                }px`;

                this.ctx.cellInstances.forEach((ins) => {
                    if (
                        ins.col === this.ctx.startInstance!.col &&
                        ins.colspan === this.ctx.startInstance!.colspan
                    ) {
                        this.ctx.activeEls!.push(ins.cellEl);
                        ins.cellEl.classList.add("tableberg-drag-active-col");
                    }
                });
            } else {
                this.ctx.dragPreview!.style.width = `${rootBox.width}px`;
                this.ctx.dragPreview!.style.height = `${
                    this.ctx.startBox!.height
                }px`;

                this.ctx.cellInstances.forEach((ins) => {
                    if (
                        ins.row === this.ctx.startInstance!.row &&
                        ins.rowspan === this.ctx.startInstance!.rowspan
                    ) {
                        this.ctx.activeEls!.push(ins.cellEl);
                        ins.cellEl.classList.add("tableberg-drag-active-row");
                    }
                });
            }

            this.ctx.rootEl
                .querySelectorAll(".tableberg-drag-over-" + oldType)
                .forEach((el) => {
                    el.classList.remove("tableberg-drag-over-" + oldType);
                });

            const over = this.ctx.overInstance!;
            this.ctx.cellInstances.forEach((ins) => {
                if (
                    (this.ctx.type === "row" && ins.row === over.row) ||
                    (this.ctx.type === "col" && ins.col === over.col)
                ) {
                    ins.cellEl.classList.add(
                        "tableberg-drag-over-" + this.ctx.type,
                    );
                }
            });
        }

        if (this.ctx.type === "col") {
            this.ctx.dragPreview!.style.left = `${
                evt.x - (this.ctx.startPos!.x - this.ctx.startBox!.left)
            }px`;
            this.ctx.dragPreview!.style.top = `${rootBox.top}px`;
        } else {
            this.ctx.dragPreview!.style.top = `${
                evt.y - (this.ctx.startPos!.y - this.ctx.startBox!.top)
            }px`;
            this.ctx.dragPreview!.style.left = `${rootBox.left}px`;
        }
    }

    private touchMove(evt: TouchEvent) {
        // @ts-ignore
        evt.x = evt.touches[0].clientX;
        // @ts-ignore
        evt.y = evt.touches[0].clientY;
        this.mouseMove(evt as any);
    }

    private onOver() {
        if (!this.ctx.isActive) {
            return;
        }
        this.ctx.rootEl
            .querySelectorAll(".tableberg-drag-over-" + this.ctx.type)
            .forEach((el) => {
                el.classList.remove("tableberg-drag-over-" + this.ctx.type);
            });

        this.ctx.cellInstances.forEach((ins) => {
            if (
                (this.ctx.type === "row" && ins.row === this.row) ||
                (this.ctx.type === "col" && ins.col === this.col)
            ) {
                ins.cellEl.classList.add(
                    "tableberg-drag-over-" + this.ctx.type,
                );
            }
        });
        this.ctx.overInstance = this;
    }
    private onLeave() {
        if (!this.ctx.isActive) {
            return;
        }
    }

    private onDrop() {
        if (
            !this.ctx.isActive ||
            (this.ctx.type === "row" &&
                this.ctx.startInstance!.row === this.row) ||
            (this.ctx.type === "col" &&
                this.ctx.startInstance!.col === this.col)
        ) {
            return;
        }
        this.makeMove(this.ctx);
    }

    private cleanUp() {
        this.ctx.dragPreview?.remove();

        document.removeEventListener("mousemove", this.onMouseMoveFn);
        document.removeEventListener("mouseup", this.cleanUpEvt);
        if (HAS_TOUCH) {
            document.removeEventListener("touchmove", this.onTouchMoveFn);
            document.removeEventListener("touchend", this.cleanUpEvt);
        }

        this.ctx.rootEl
            .querySelectorAll(".tableberg-drag-over-" + this.ctx.type)
            .forEach((el) => {
                el.classList.remove("tableberg-drag-over-" + this.ctx.type);
            });

        this.ctx.activeEls?.forEach((el) => {
            el.classList.remove("tableberg-drag-active-" + this.ctx.type);
        });

        this.ctx.type = undefined;
        this.ctx.isActive = false;
        this.ctx.overInstance = undefined;
        this.ctx.activeEls = undefined;
    }

    public remove() {
        this.ctx.cellInstances = this.ctx.cellInstances.filter(
            (ins) => ins !== this,
        );
        this.cellEl?.removeEventListener("mousedown", this.startEvt);

        if (HAS_TOUCH) {
            this.cellEl?.removeEventListener("touchstart", this.touchEvt!);
        }

        this.cellEl?.removeEventListener("mouseenter", this.overEvt);
        this.cellEl?.removeEventListener("mouseleave", this.leaveEvt);
        this.cellEl?.removeEventListener("mouseup", this.dropEvt);
    }
}

export const moveCol = (
    storeActions: BlockEditorStoreActions,
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    subject: number,
    target: number,
) => {
    const cells: TablebergCellInstance[] = tableBlock.innerBlocks as any;
    let pendingCols: TablebergCellInstance[] = [];
    const newCells: TablebergCellInstance[] = [];
    let canMove = true;

    const toRight = subject < target;

    if (toRight) {
        let lastRowInserted = -1;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const attrs = cell.attributes;

            if (attrs.col < target && attrs.col + attrs.colspan > target) {
                canMove = false;
                break;
            }
            const cloned = cloneBlock(cell);

            if (attrs.row - lastRowInserted > 1) {
                lastRowInserted = attrs.row - 1;
                newCells.push(...pendingCols);
                pendingCols = [];
            }
            if (attrs.col === subject) {
                if (attrs.colspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.col = target;
                pendingCols.push(cloned);

                continue;
            }

            if (attrs.col < subject) {
                newCells.push(cloned);
                continue;
            }
            if (attrs.col <= target) {
                cloned.attributes.col -= 1;
                newCells.push(cloned);
                continue;
            }
            if (lastRowInserted !== attrs.row) {
                lastRowInserted = attrs.row;
                newCells.push(...pendingCols);

                pendingCols = [];
            }
            newCells.push(cloned);
        }

        if (pendingCols.length > 0) {
            newCells.push(...pendingCols);
            pendingCols = [];
        }
    } else {
        let lastRowInserted = tableBlock.attributes.rows;
        for (let i = cells.length - 1; i > -1; i--) {
            const cell = cells[i];
            const attrs = cell.attributes;

            if (attrs.col < target && attrs.col + attrs.colspan > target) {
                canMove = false;
                break;
            }
            const cloned = cloneBlock(cell);
            if (lastRowInserted - attrs.row > 1) {
                lastRowInserted = attrs.row - 1;
                newCells.push(...pendingCols);
                pendingCols = [];
            }
            if (attrs.col === subject) {
                if (attrs.colspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.col = target;
                pendingCols.push(cloned);

                continue;
            }

            if (attrs.col > subject) {
                newCells.push(cloned);
                continue;
            }
            if (attrs.col >= target) {
                cloned.attributes.col += 1;
                newCells.push(cloned);
                continue;
            }
            if (lastRowInserted !== attrs.row) {
                lastRowInserted = attrs.row;
                newCells.push(...pendingCols);
                pendingCols = [];
            }
            newCells.push(cloned);
        }
        if (pendingCols.length > 0) {
            newCells.push(...pendingCols);
            pendingCols = [];
        }

        newCells.sort((a, b) => {
            const rDiff = a.attributes.row - b.attributes.row;
            if (rDiff === 0) {
                return a.attributes.col - b.attributes.col;
            }
            return rDiff;
        });
    }

    if (!canMove) {
        console.warn("[Tableberg] Cannot move inside columns");
        storeActions.removeBlocks(newCells.map((cell) => cell.clientId));
        return;
    }

    storeActions.replaceInnerBlocks(tableBlock.clientId, newCells);
};

export const moveRow = (
    storeActions: BlockEditorStoreActions,
    tableBlock: BlockInstance<TablebergBlockAttrs>,
    subject: number,
    target: number,
) => {
    const cells: TablebergCellInstance[] = tableBlock.innerBlocks as any;
    let pendingCols: TablebergCellInstance[] = [];
    const newCells: TablebergCellInstance[] = [];
    let canMove = true;

    const toDown = subject < target;

    if (toDown) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const attrs = cell.attributes;

            if (attrs.col < target && attrs.col + attrs.colspan > target) {
                canMove = false;
                break;
            }
            const cloned = cloneBlock(cell);

            if (attrs.row === subject) {
                if (attrs.rowspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.row = target;
                pendingCols.push(cloned);
                continue;
            }

            if (attrs.row > target && pendingCols.length > 0) {
                newCells.push(...pendingCols);
                pendingCols = [];
            }

            if (attrs.row > subject && attrs.row <= target) {
                cloned.attributes.row -= 1;
            }
            newCells.push(cloned);
        }
        if (pendingCols.length > 0) {
            newCells.push(...pendingCols);
            pendingCols = [];
        }
    } else {
        for (let i = cells.length - 1; i > -1; i--) {
            const cell = cells[i];
            const attrs = cell.attributes;

            if (attrs.col < target && attrs.col + attrs.colspan > target) {
                canMove = false;
                break;
            }
            const cloned = cloneBlock(cell);
            if (attrs.row === subject) {
                if (attrs.rowspan > 1) {
                    canMove = false;
                    break;
                }
                cloned.attributes.row = target;
                pendingCols.push(cloned);
                continue;
            }

            if (attrs.row < target && pendingCols.length > 0) {
                newCells.push(...pendingCols);
                pendingCols = [];
            }

            if (attrs.row < subject && attrs.row >= target) {
                cloned.attributes.row += 1;
            }
            newCells.push(cloned);
        }
        if (pendingCols.length > 0) {
            newCells.push(...pendingCols);
            pendingCols = [];
        }

        newCells.reverse();
    }

    if (!canMove) {
        console.warn("[Tableberg] Cannot move inside rows");
        storeActions.removeBlocks(newCells.map((cell) => cell.clientId));
        return;
    }
    storeActions.replaceInnerBlocks(tableBlock.clientId, newCells);
};
