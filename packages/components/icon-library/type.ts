export interface IconsLibraryIconProps {
    iconName: string;
    type: string;
    icon: SVGElement;
}
export interface IconsLibraryProps {
    value: IconsLibraryIconProps;
    onSelect: (iconObject: IconsLibraryIconProps) => null;
}
export interface IconsLibraryContentProps extends IconsLibraryProps {
    search: string;
    subCategoryFilter: string;
    mainCategoryFilter: string;
}
export interface IconsLibrarySidebarProps {
    subCategoryFilter: string;
    search: string;
    setSubCategoryFilter: (subCategoryFilter: string) => null;
    setSearch: (search: string) => null;
    mainCategoryFilter: string;
    setMainCategoryFilter: (mainCategoryFilter: string) => null;
}
