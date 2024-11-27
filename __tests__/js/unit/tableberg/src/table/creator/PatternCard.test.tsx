import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pattern, {
	PatternOptions,
} from '@tableberg/src/table/creator/includes/Pattern';

beforeAll(() => {
	jest.mock('@wordpress/block-editor', () => ({
		BlockPreview: () => (
			<div data-testid="block-preview-mock">Mock BlockPreview</div>
		),
	}));

	jest.mock('@tableberg/src/components/InView', () => ({
		__esModule: true,
		default: ({ children }: { children: React.ReactNode }) => (
			<div data-testid="in-view-mock">{children}</div>
		),
	}));
});

describe('PatternCard component', () => {
	it('should render patter screenshot image if an available one supplied via props', async () => {
		const testPattern: PatternOptions = {
			name: 'tableberg/upsell-1',
			title: 'Upsell 1',
			isUpsell: true,
			blocks: [],
			viewportWidth: 0,
			tablebergPatternScreenshot: 'https://example.com/image.png',
		};

		const patternObj = new Pattern(testPattern);

		const PatternCard =
			require('@tableberg/src/table/creator/PatternCard').default;

		render(
			<PatternCard
				pattern={patternObj}
				setUpsell={jest.fn()}
				onSelect={jest.fn()}
			/>
		);

		const imageElement = screen.getByAltText(testPattern.title);
		fireEvent.load(imageElement);
		expect(imageElement).toBeInTheDocument();

		// In the event no valid url is supplied.
		fireEvent.error(imageElement);
		expect(imageElement).not.toBeInTheDocument();
	});
});
