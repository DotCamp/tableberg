const CONTEXT_MAP = new Map<string, Context>();
const HAS_TOUCH: boolean =
    "ontouchstart" in window || (navigator.maxTouchPoints as any);

const SIDE_CLASSES = {
    left: "tableberg-drag-left",
    right: "tableberg-drag-right",
    top: "tableberg-drag-top",
    bottom: "tableberg-drag-bottom",
} as const;

let ctxLen = 1;

type Sides = "top" | "right" | "bottom" | "left";

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
    public lastSide?: Sides;


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

    private onMouseMoveFn: (evt: MouseEvent) => void = (evt) =>
        this.mouseMove(evt);
    private onTouchMoveFn: (evt: TouchEvent) => void = (evt) =>
        this.touchMove(evt);
    private cleanUpEvt: () => void = () => this.cleanUp();

    constructor(
        cellEL: HTMLTableCellElement,
        row: number,
        col: number,
        rowspan: number,
        colspan: number,
    ) {
        this.cellEl = cellEL;

        this.row = row;
        this.col = col;
        this.rowspan = rowspan;
        this.colspan = colspan;

        const root = cellEL.closest("div")!;
        if (!root.dataset.__tableberg_drag_ctx) {
            root.dataset.__tableberg_drag_ctx = `${ctxLen++}`;
            this.ctx = new Context(root);
            CONTEXT_MAP.set(root.dataset.__tableberg_drag_ctx, this.ctx);
        } else {
            this.ctx = CONTEXT_MAP.get(root.dataset.__tableberg_drag_ctx)!;
        }

        this.ctx.cellInstances.push(this);

        const start = (evt: MouseEvent | TouchEvent) => {
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
                y: posY
            };

            this.ctx.dragPreview.style.left = posX + "px";
            this.ctx.dragPreview.style.top = posY + "px";
        };

        cellEL.addEventListener("mousedown", start);

        if (HAS_TOUCH) {
            cellEL.addEventListener("touchstart", (evt: TouchEvent) => {
                /**
                 * Only start dragging if there's one touch
                 * two or more are for zoom/pinch or other actions
                 * we don't want to mess with
                 */
                if (evt.touches.length !== 1) {
                    return;
                }
                start(evt);
            });
        }

        cellEL.addEventListener("mouseenter", () => this.onOver());
        cellEL.addEventListener("mouseleave", () => this.onLeave());
        cellEL.addEventListener("mouseup", () => this.onDrop());
    }

    private doesMatchBegin(other: DragNDropSorting): boolean {
        return (
            (this.ctx.type === "row" && this.row == other.row) ||
            (this.ctx.type === "col" && this.col === other.col)
        );
    }
    private doesMatchEnd(other: DragNDropSorting): boolean {
        return (
            (this.ctx.type === "row" &&
                this.row + this.rowspan === other.row + other.rowspan) ||
            (this.ctx.type === "col" &&
                this.col + this.colspan === other.col + other.colspan)
        );
    }

    private mouseMove(evt: MouseEvent) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        const cellEl = this.ctx.overInstance?.cellEl!;
        const box = cellEl.getBoundingClientRect();

        let side: Sides;

        if (this.ctx.type === "col") {
            if (box.left + box.width / 2 > evt.x) {
                side = "left";
            } else {
                side = "right";
            }
        } else {
            if (box.top + box.height / 2 > evt.y) {
                side = "top";
            } else {
                side = "bottom";
            }
        }

        if (side !== this.ctx.lastSide) {
            const oldClass = SIDE_CLASSES[this.ctx.lastSide!];
            const newClass = SIDE_CLASSES[side];
            const over = this.ctx.overInstance!;
            const wasBegin = ["top", "left"].indexOf(this.ctx.lastSide!) > -1;
            this.ctx.cellInstances.forEach((ins) => {
                if (wasBegin) {
                    if (over.doesMatchBegin(ins)) {
                        ins.cellEl.classList.remove(oldClass);
                    }
                    if (over.doesMatchEnd(ins)) {
                        ins.cellEl.classList.add(newClass);
                    }
                } else {
                    if (over.doesMatchEnd(ins)) {
                        ins.cellEl.classList.remove(oldClass);
                    }
                    if (over.doesMatchBegin(ins)) {
                        ins.cellEl.classList.add(newClass);
                    }
                }
            });
            this.ctx.lastSide = side;
        }
    }

    private touchMove(evt: TouchEvent) {
        console.log("Touch Move: ", evt);
    }

    private onOver() {
        if (!this.ctx.isActive) {
            return;
        }
        const old = this.ctx.overInstance!;

        if (old.row !== this.row) {
            if (old.col === this.col) {
                this.ctx.type = "row";
            } else {
                this.ctx.type = "col";
            }
        } else {
            this.ctx.type = "col";
        }

        if (this.ctx.type === "row") {
            if (old.row < this.row) {
                this.ctx.lastSide = "top";
            } else {
                this.ctx.lastSide = "bottom";
            }
        } else {
            if (old.col > this.col) {
                this.ctx.lastSide = "right";
            } else {
                this.ctx.lastSide = "left";
            }
        }

        this.ctx.overInstance = this;

        const newClass = SIDE_CLASSES[this.ctx.lastSide!];
        const isBegin = ["top", "left"].indexOf(this.ctx.lastSide!) > -1;
        this.ctx.cellInstances.forEach((ins) => {
            if (
                (isBegin && this.doesMatchBegin(ins)) ||
                (!isBegin && this.doesMatchEnd(ins))
            ) {
                ins.cellEl.classList.add(newClass);
            }
        });
    }
    private onLeave() {
        if (!this.ctx.isActive) {
            return;
        }

        const wasBegin = ["top", "left"].indexOf(this.ctx.lastSide!) > -1;
        const oldClass = SIDE_CLASSES[this.ctx.lastSide!];
        this.ctx.cellInstances.forEach((ins) => {
            if (
                (wasBegin && this.doesMatchBegin(ins)) ||
                (!wasBegin && this.doesMatchEnd(ins))
            ) {
                ins.cellEl.classList.remove(oldClass);
            }
        });
    }

    private onDrop() {
        console.log("Drop");
    }

    private cleanUp() {
        console.log("CleanUp");

        this.ctx.dragPreview?.remove();

        document.removeEventListener("mousemove", this.onMouseMoveFn);
        document.removeEventListener("mouseup", this.cleanUpEvt);
        if (HAS_TOUCH) {
            document.removeEventListener("touchmove", this.onTouchMoveFn);
            document.removeEventListener("touchend", this.cleanUpEvt);
        }

        const wasBegin = ["top", "left"].indexOf(this.ctx.lastSide!) > -1;
        const oldClass = SIDE_CLASSES[this.ctx.lastSide!];
        const over = this.ctx.overInstance!;
        this.ctx.cellInstances.forEach((ins) => {
            if (
                (wasBegin && over.doesMatchBegin(ins)) ||
                (!wasBegin && over.doesMatchEnd(ins))
            ) {
                ins.cellEl.classList.remove(oldClass);
            }
        });

        this.ctx.isActive = false;
        this.ctx.overInstance = undefined;
        this.ctx.lastSide = undefined;
    }
}
