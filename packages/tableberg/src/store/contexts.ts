import { createContext } from "react";
import { TablebergRenderMode } from "..";
interface TablebergCtx {
    rootEl?: HTMLElement;
    render?: TablebergRenderMode;
}
export const TablebergCtx = createContext<TablebergCtx>({});