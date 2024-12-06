import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pattern, {
	PatternOptions,
} from '@tableberg/src/table/creator/includes/Pattern';
import { userEvent } from '@testing-library/user-event';

const blockPreviewMockTestId = 'block-preview-mock';

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

describe('PatternCard component', () => {
	it('should render patter screenshot image if an available one supplied via props', async () => {
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
	it('should select card on click', async () => {
		const notUpsellPattern = new Pattern({
			...testPatternOptions,
			isUpsell: false,
		});

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

		const cardElement = screen.getByRole('button');
		const user = userEvent.setup();
		await user.click(cardElement);

		expect(selectCallback).toHaveBeenCalled();
	});
	it('should set upsell for  selected card', async () => {
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

		const cardElement = screen.getByRole('button');
		const user = userEvent.setup();
		await user.click(cardElement);

		expect(selectCallback).not.toHaveBeenCalled();
		expect(upsellCallback).toHaveBeenCalled();
	});
	it.todo('should render skeleton layout when component is busy');
});
