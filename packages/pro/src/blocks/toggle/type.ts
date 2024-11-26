export interface ToggleBlockTypes {
    activeTab: number;
    tabs: Array<{
        title: string;
        content: string;
    }>;
    defaultActiveTabIndex: number;
    alignment: string;
    gap: string;
    tabType: string;
    activeTabTextColor: string;
    activeTabBackgroundColor: string;
    inactiveTabTextColor: string;
    inactiveTabBackgroundColor: string;
    tabBorderRadius: string;
}
