import { SpacingTypes } from "../../utils/types";

export interface BlockConfig {
    blockID: string;
    starCount: number;
    starSize: string;
    starColor: string | null;
    selectedStars: number;
    reviewText: string;
    reviewTextAlign: string;
    reviewTextColor: string | null;
    starAlign: string;
    padding: SpacingTypes;
    margin: SpacingTypes;
}
