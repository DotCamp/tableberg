import classNames from 'classnames';
import { Spinner } from '@wordpress/components';
import InView from '../../components/InView';
// @ts-ignore
import { BlockPreview } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';
import { useEffect, useState } from 'react';
import Pattern from './includes/Pattern';

interface PatternCardProps {
	pattern: Pattern;
	setUpsell: (patternName: string) => void;
	onSelect: (block: BlockInstance) => void;
}

/**
 * Pattern card component to display pattern related data and operations.
 *
 * @param props           Component properties.
 * @param props.pattern   Pattern data.
 * @param props.setUpsell Upsell setter.
 * @param props.onSelect  Pattern selection handler.
 * @class
 */
const PatternCard: React.FC<PatternCardProps> = ({
	pattern,
	setUpsell,
	onSelect,
}) => {
	const [useImagePreview, setUseImagePreview] = useState(false);
	const [isBusy, setIsBusy] = useState(true);

	const handleImageError = () => {
		setUseImagePreview(false);
		setIsBusy(false);
	};

	useEffect(() => {
		setUseImagePreview(pattern.screenshotUrl !== undefined);
	}, [pattern]);

	const handleImageLoad = () => {
		setIsBusy(false);
	};

	return (
		// eslint-disable-next-line jsx-a11y/interactive-supports-focus,jsx-a11y/click-events-have-key-events
		<div
			role={'button'}
			className={classNames({
				'tableberg-pattern-library-preview': true,
				'tableberg-pattern-library-preview-upsell': pattern.isUpsell,
			})}
			onClick={() =>
				pattern.isUpsell
					? setUpsell(pattern.name.substring(17))
					: onSelect(pattern.blocks[0])
			}
		>
			<div className={'tableberg-pattern-library-preview-item'}>
				{isBusy && (
					<div
						className={
							'tableberg-pattern-library-preview-item-busy'
						}
					>
						<Spinner
							style={{
								width: '50px',
								height: '50px',
							}}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						/>
					</div>
				)}
				<div className={'tableberg-pattern-library-preview-item-view'}>
					<InView>
						{useImagePreview ? (
							<img
								alt={pattern.title}
								className={
									'tableberg-pattern-library-preview-item-view-image'
								}
								onError={handleImageError}
								onLoad={handleImageLoad}
								src={pattern.screenshotUrl}
							/>
						) : (
							<BlockPreview
								blocks={pattern.blocks}
								viewportWidth={pattern.viewportWidth}
							/>
						)}
					</InView>
				</div>
			</div>
			<p>{pattern.title}</p>
		</div>
	);
};

export default PatternCard;
