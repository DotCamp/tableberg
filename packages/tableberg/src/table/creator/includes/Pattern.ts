import type { BlockInstance } from '@wordpress/blocks';

export interface PatternOptions {
	name: string;
	title: string;
	isUpsell: boolean;
	blocks: BlockInstance[];
	viewportWidth: number;
	tablebergPatternScreenshot: false | string;
	categories: string[];
	categorySlugs: string[];
}

export interface PatternType
	extends Omit<PatternOptions, 'tablebergPatternScreenshot'> {
	screenshotUrl: string | undefined;
}

/**
 * Pattern class to represent a pattern.
 *
 * This class both uses API properties assigned to fetched patterns and custom properties.
 * @param options Pattern options.
 * @class
 */
class Pattern implements PatternType {
	screenshotUrl!: string | undefined;
	name!: string;
	title!: string;
	isUpsell!: boolean;
	blocks!: BlockInstance[];
	viewportWidth!: number;
	categories!: string[];
	categorySlugs!: string[];

	constructor(options: PatternOptions) {
		Object.assign(this, options);
		this.screenshotUrl = options.tablebergPatternScreenshot || undefined;
	}
}

export default Pattern;
