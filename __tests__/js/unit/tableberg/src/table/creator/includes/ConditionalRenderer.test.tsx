import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const testId = 'conditional-renderer-test';
const TestComponent = () => <div data-testid={testId}>Test</div>;

describe('ConditionalRenderer component', () => {
	it('should render children if condition is true', () => {
		const ConditionalRenderer =
			require('@tableberg/src/table/creator/ConditionalRenderer').default;

		render(
			<ConditionalRenderer conditionToTest={true}>
				<TestComponent />
			</ConditionalRenderer>
		);

		expect(screen.getByTestId(testId)).toBeInTheDocument();
	});

	it('should not render children if condition is not met', () => {
		const ConditionalRenderer =
			require('@tableberg/src/table/creator/ConditionalRenderer').default;

		render(
			<ConditionalRenderer conditionToTest={false}>
				<TestComponent />
			</ConditionalRenderer>
		);

		expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
	});
});
