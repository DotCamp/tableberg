import { IconsLibraryIconProps } from "../../components/icon-library/type";

export interface BlockTypes {
    blockID: string;
    list: string;
    icon: IconsLibraryIconProps;
    selectedIcon: string;
    alignment: string;
    iconColor: string;
    iconSize: number;
    fontSize: number;
    itemSpacing: number;
    columns: number;
    maxMobileColumns: number;
    isRootList: boolean;
    textColor: string;
    backgroundColor: string;
    padding: object;
    margin: object;
}
