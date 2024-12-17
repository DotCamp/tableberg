import { type FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';

/**
 * Pattern card preview section skeleton component.
 *
 * This component can be used to display a skeleton layout for pattern card preview section on busy/load processes.
 * @class
 */
const PatternCardPreviewSkeleton: FC = () => {
	return (
		<div className={'tableberg-pattern-library-card-skeleton-preview'}>
			<FontAwesomeIcon icon={faEyeSlash} />
		</div>
	);
};

export default PatternCardPreviewSkeleton;
