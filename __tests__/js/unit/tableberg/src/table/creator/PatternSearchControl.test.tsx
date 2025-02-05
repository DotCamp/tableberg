import { render, screen, fireEvent } from '@testing-library/react';
import PatternSearchControl from '@tableberg/src/table/creator/PatternSearchControl';

describe('PatternSearchControl component', () => {
	it('should limit search according to given prop', async () => {
		const onChangeSpy = jest.fn();

		const minChars = 5;
		render(
			<PatternSearchControl onChange={onChangeSpy} minChars={minChars} />
		);

		/**
		 * Generate text of given length.
		 *
		 * @param length Length of the text to generate.
		 *
		 * @return Generated text.
		 */
		const generateText = (length: number): string => {
			return length
				? Array(length)
						.fill(1)
						.map((cV: number, index) => String(cV + index))
						.join('')
				: '';
		};

		const minText = generateText(minChars - 1);
		const maxText = generateText(minChars);

		const searchInput = screen.getByRole('searchbox');
		fireEvent.change(searchInput, { target: { value: minText } });
		expect(onChangeSpy).toHaveBeenCalledWith('');

		onChangeSpy.mockClear();

		fireEvent.change(searchInput, { target: { value: maxText } });
		expect(onChangeSpy).toHaveBeenCalledWith(maxText);
	});
});
