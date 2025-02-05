import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('health tests for basic functionality of testing environment', () => {
	test('assertion check', () => {
		expect(true).toBe(true);
	});
	test('react component check', () => {
		render(<div>hello</div>);
		expect(screen.queryByText('hello')).toBeInTheDocument();
	});
});
