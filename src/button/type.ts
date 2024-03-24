export interface ButtonBlockTypes {
    text: string;
    align: "left" | "right" | "center";
    width: number | undefined;
    backgroundColor: string;
    textColor: string;
    backgroundHoverColor: string | undefined;
    textHoverColor: string | undefined;
    textAlign: string;
    id: string;
    url: string | undefined;
    linkTarget: "_blank" | undefined;
    rel: string | undefined;
    backgroundGradient: string | null;
    backgroundHoverGradient: string | null;
    padding: {
        top: string;
        bottom: string;
        left: string;
        right: string;
    };
}
