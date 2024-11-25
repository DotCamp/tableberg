export interface ToggleBlockTypes {
    activeTab: number;
    tabs: Array<{
        title: string;
        content: string;
    }>;
    alignment: string;
    gap: string;
    tabType: string;
    activeTabIndicatorColor: string;
    activeTabTextColor: string;
    activeTabBackgroundColor: string;
    inactiveTabTextColor: string;
    inactiveTabBackgroundColor: string;
    tabBorderRadius: string;
}
