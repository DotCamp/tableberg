import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('InView component', () => {
	it('should add supplied class names to the wrapper', () => {
		const InView = require('@tableberg/src/components/InView').default;

		// Mock the IntersectionObserver.
		window.IntersectionObserver = jest.fn().mockImplementation(() => ({
			observe: jest.fn(),
			disconnect: jest.fn(),
		}));

		const wrapperClassList = ['test-class-01', 'test-class-02'];

		const renderedContent = render(
			<InView classNames={wrapperClassList}>
				<i>some stuff</i>
			</InView>
		);

		expect(renderedContent.container.firstChild).toHaveClass(
			...wrapperClassList
		);
	});
});
