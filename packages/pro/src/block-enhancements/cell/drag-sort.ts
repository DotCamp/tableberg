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
    public startBox?: DOMRect;
    public lastSide?: Sides;
    public toEnd?: boolean;

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
        }

        const cellEl = this.ctx.overInstance?.cellEl!;
        const box = cellEl.getBoundingClientRect();

        let side: Sides;

        if (this.ctx.type === "col") {
            if (box.left + box.width / 2 > evt.x) {
                side = "left";
            } else {
                side = "right";
            }
            this.ctx.dragPreview!.style.left = `${
                evt.x - (this.ctx.startPos!.x - this.ctx.startBox!.left)
            }px`;
            this.ctx.dragPreview!.style.top = `${rootBox.top}px`;
        } else {
            if (box.top + box.height / 2 > evt.y) {
                side = "top";
            } else {
                side = "bottom";
            }
            this.ctx.dragPreview!.style.top = `${
                evt.y - (this.ctx.startPos!.y - this.ctx.startBox!.top)
            }px`;
            this.ctx.dragPreview!.style.left = `${rootBox.left}px`;
        }

        if (side !== this.ctx.lastSide) {
            const oldClass = SIDE_CLASSES[this.ctx.lastSide!];

            this.ctx.rootEl.querySelectorAll("." + oldClass).forEach((el) => {
                el.classList.remove(oldClass);
            });

            const newClass = SIDE_CLASSES[side];
            const over = this.ctx.overInstance!;
            const wasBegin = ["top", "left"].indexOf(this.ctx.lastSide!) > -1;
            this.ctx.toEnd = wasBegin;
            this.ctx.cellInstances.forEach((ins) => {
                if (wasBegin) {
                    if (over.doesMatchEnd(ins)) {
                        ins.cellEl.classList.add(newClass);
                    }
                } else {
                    if (over.doesMatchBegin(ins)) {
                        ins.cellEl.classList.add(newClass);
                    }
                }
            });
            this.ctx.lastSide = side;
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
        this.ctx.overInstance = this;
    }
    private onLeave() {
        if (!this.ctx.isActive) {
            return;
        }
    }

    private onDrop() {
        if (!this.ctx.isActive) {
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

        const oldClass = SIDE_CLASSES[this.ctx.lastSide!];

        this.ctx.rootEl.querySelectorAll("." + oldClass).forEach((el) => {
            el.classList.remove(oldClass);
        });

        this.ctx.activeEls?.forEach((el) => {
            el.classList.remove("tableberg-drag-active-" + this.ctx.type);
        });

        this.ctx.type = undefined;
        this.ctx.isActive = false;
        this.ctx.overInstance = undefined;
        this.ctx.lastSide = undefined;
        this.ctx.activeEls = undefined;
    }

    public remove() {
        this.ctx.cellInstances = this.ctx.cellInstances.filter(
            (ins) => ins !== this,
        );
    }
}
