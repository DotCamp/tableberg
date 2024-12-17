import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pattern, {
	PatternOptions,
} from '@tableberg/src/table/creator/includes/Pattern';
import { userEvent } from '@testing-library/user-event';

const blockPreviewMockTestId = 'block-preview-mock';
const skeletonPreviewMockTestId = 'skeleton-mock';

beforeAll(() => {
	jest.mock('@wordpress/block-editor', () => ({
		BlockPreview: () => (
			<div data-testid={blockPreviewMockTestId}>Mock BlockPreview</div>
		),
	}));

	jest.mock('@tableberg/src/components/InView', () => ({
		__esModule: true,
		default: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="in-view-mock">{children}</div>
		),
	}));

	jest.mock('@tableberg/src/table/creator/PatternCardPreviewSkeleton', () => {
		return {
			__esModule: true,
			default: () => (
				<div data-testid={skeletonPreviewMockTestId}>Mock Skeleton</div>
			),
		};
	});
});

const testPatternOptions: PatternOptions = {
	name: 'tableberg/upsell-1',
	title: 'Upsell 1',
	isUpsell: true,
	blocks: [],
	viewportWidth: 0,
	tablebergPatternScreenshot: 'https://example.com/image.png',
	categories: [],
};

const patternObj = new Pattern(testPatternOptions);

const notUpsellPattern = new Pattern({
	...testPatternOptions,
	isUpsell: false,
});

describe('PatternCard component', () => {
	it('should render pattern screenshot image if an available one supplied via props', async () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		render(
			<PatternCard
				pattern={patternObj}
				setUpsell={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		const imageElement = screen.getByAltText(testPatternOptions.title);
		fireEvent.load(imageElement);
		expect(imageElement).toBeInTheDocument();

		// In the event no valid url is supplied.
		fireEvent.error(imageElement);
		const fallbackRender = screen.getByTestId(blockPreviewMockTestId);
		expect(imageElement).not.toBeInTheDocument();
		expect(fallbackRender).toBeInTheDocument();
	});
	it('should select card on click if component is not busy', async () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		const selectCallback = jest.fn();

		render(
			<PatternCard
				pattern={notUpsellPattern}
				setUpsell={jest.fn()}
				onSelect={selectCallback}
			/>
		);

		const imageElement = screen.getByAltText(testPatternOptions.title);
		fireEvent.load(imageElement);

		const cardElement = screen.getByRole('gridcell');
		const user = userEvent.setup();
		await user.click(cardElement);

		expect(selectCallback).toHaveBeenCalled();
	});
	it('should set upsell for selected card if component is not busy', async () => {
		const upsellPattern = new Pattern({
			...testPatternOptions,
		});

		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		const upsellCallback = jest.fn();
		const selectCallback = jest.fn();

		render(
			<PatternCard
				pattern={upsellPattern}
				setUpsell={upsellCallback}
				onSelect={selectCallback}
			/>
		);

		const imageElement = screen.getByAltText(testPatternOptions.title);
		fireEvent.load(imageElement);

		const cardElement = screen.getByRole('gridcell');
		const user = userEvent.setup();
		await user.click(cardElement);

		expect(selectCallback).not.toHaveBeenCalled();
		expect(upsellCallback).toHaveBeenCalled();
		expect(upsellCallback).toHaveBeenCalledWith(
			testPatternOptions.name.replace(/^tableberg\/upsell-/, '')
		);
	});
	it('should render skeleton preview layout while image is loading', () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		render(
			<PatternCard
				pattern={patternObj}
				setUpsell={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		expect(
			screen.queryByTestId(skeletonPreviewMockTestId)
		).toBeInTheDocument();
	});
	it('should remove skeleton preview layout after image is loaded', () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		render(
			<PatternCard
				pattern={patternObj}
				setUpsell={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		const imageElement = screen.getByAltText(testPatternOptions.title);
		fireEvent.load(imageElement);

		expect(
			screen.queryByTestId(skeletonPreviewMockTestId)
		).not.toBeInTheDocument();
	});

	it('should remove skeleton preview layout after image is not loaded due to error', () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		render(
			<PatternCard
				pattern={patternObj}
				setUpsell={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		const imageElement = screen.getByAltText(testPatternOptions.title);
		fireEvent.error(imageElement);

		expect(
			screen.queryByTestId(skeletonPreviewMockTestId)
		).not.toBeInTheDocument();
	});
	it('should render a dummy card if enabled', () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		render(
			<PatternCard
				pattern={patternObj}
				setUpsell={jest.fn()}
				onSelect={jest.fn()}
				isDummy={true}
			/>
		);

		expect(
			screen.queryByAltText(testPatternOptions.title)
		).not.toBeInTheDocument();

		expect(
			screen.queryByTestId(skeletonPreviewMockTestId)
		).toBeInTheDocument();
	});
	it('should suppress card selection event if it is a dummy', async () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		const onSelectSpy = jest.fn();

		render(
			<PatternCard
				pattern={notUpsellPattern}
				setUpsell={jest.fn()}
				onSelect={onSelectSpy}
				isDummy={true}
			/>
		);

		const cardElement = screen.getByRole('gridcell');
		const user = userEvent.setup();
		await user.click(cardElement);

		expect(onSelectSpy).not.toHaveBeenCalled();
	});
	it('should suppress upsell event if it is a dummy', async () => {
		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		const onUpsellSpy = jest.fn();

		render(
			<PatternCard
				pattern={patternObj}
				setUpsell={onUpsellSpy}
				onSelect={jest.fn()}
				isDummy={true}
			/>
		);

		const cardElement = screen.getByRole('gridcell');
		const user = userEvent.setup();
		await user.click(cardElement);

		expect(onUpsellSpy).not.toHaveBeenCalled();
	});
});
