import { type FC } from 'react';
import { SearchControl } from '@wordpress/components';

/**
 * Pattern search control component.
 *
 * According to the minChars prop, it triggers the onChange callback function either with the search value or an empty string.
 * This way it can be used to control the search input in update and reset scenarios.
 *
 * @param props              Component properties.
 * @param props.onChange     Callback function to handle search changes.
 * @param [props.minChars=3] Minimum number of characters to trigger search.
 * @class
 */
const PatternSearchControl: FC<{
	onChange: (value: string) => void;
	minChars?: number;
}> = ({ onChange, minChars = 3 }) => {
	const handleSearch = (search: string) => {
		let searchValue = search.trim();

		if (searchValue.length < minChars) {
			searchValue = '';
		}

		onChange(searchValue);
	};

	return (
		<SearchControl
			onChange={handleSearch}
			size={'compact'}
			placeholder={''}
		/>
	);
};

export default PatternSearchControl;
