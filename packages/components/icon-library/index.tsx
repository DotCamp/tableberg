/**
 * WordPress Dependencies
 */
import { useState } from "react";

/**
 * Custom Dependencies
 */
import Content from "./LibraryContent";
import Sidebar from "./LibrarySidebar";
import { IconsLibraryProps } from "./type";

function IconsLibrary(props: IconsLibraryProps) {
    const [search, setSearch] = useState("");
    const [subCategoryFilter, setSubCategoryFilter] = useState("");
    const [mainCategoryFilter, setMainCategoryFilter] = useState("wordpress");

    return (
        <div className="tableberg_icons_library">
            <Sidebar
                subCategoryFilter={subCategoryFilter}
                search={search}
                setSubCategoryFilter={setSubCategoryFilter as any}
                setSearch={setSearch as any}
                mainCategoryFilter={mainCategoryFilter}
                setMainCategoryFilter={setMainCategoryFilter as any}
            />
            <Content
                search={search}
                subCategoryFilter={subCategoryFilter}
                value={props.value}
                onSelect={props.onSelect}
                mainCategoryFilter={mainCategoryFilter}
            />
        </div>
    );
}

export default IconsLibrary;

export { default as IconPickerMini } from "./IconPickerMini";

export function Icon({ icon, size, style }: any) {
    
    const { viewBox, xmlns, children } = icon.props || icon.icon.props;
    const pathData = children.props.d;

    return (
        <svg viewBox={viewBox} xmlns={xmlns} height={size} width={size} style={style}>
            <path d={pathData} />
        </svg>
    );
}
