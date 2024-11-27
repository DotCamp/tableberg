import Pattern, {
	PatternOptions,
} from '@tableberg/src/table/creator/includes/Pattern';

describe('Pattern data object', () => {
	it('should convert rest supplied data to pattern object compatible', () => {
		const restPatternData01: PatternOptions = {
			name: 'tableberg/upsell-1',
			title: 'Upsell 1',
			isUpsell: true,
			blocks: [],
			viewportWidth: 0,
			tablebergPatternScreenshot: false,
		};

		const patternObject01 = new Pattern(restPatternData01);
		expect(patternObject01.screenshotUrl).toBeUndefined();

		const restPatternData2: PatternOptions = {
			...restPatternData01,
			tablebergPatternScreenshot: 'https://example.com/image.png',
		};

		const patternObject02 = new Pattern(restPatternData2);
		expect(patternObject02.screenshotUrl).toBe(
			restPatternData2.tablebergPatternScreenshot
		);
	});
});
