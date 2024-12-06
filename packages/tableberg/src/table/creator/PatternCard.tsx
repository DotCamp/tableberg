import InView from '../../components/InView';
// @ts-ignore
import { BlockPreview } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';
import { useEffect, useState, type FC } from 'react';
import type Pattern from './includes/Pattern';

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
const PatternCard: FC<PatternCardProps> = ({
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

	const handleImageLoad = () => {
		setIsBusy(false);
	};

	/**
	 * Card selection handler.
	 */
	const cardSelectionHandler = () => {
		const match = pattern.name.match(/^tableberg\/upsell-(.*)$/);

		if (pattern.isUpsell && match) {
			setUpsell(match[1]);
		} else {
			onSelect(pattern.blocks[0]);
		}
	};

	useEffect(() => {
		setUseImagePreview(pattern.screenshotUrl !== undefined);
	}, [pattern]);

	return (
		<div
			role={'gridcell'}
			tabIndex={0}
			className={'tableberg-pattern-library-card'}
			onClick={cardSelectionHandler}
			onKeyDown={(event) => {
				if (event.key === 'Enter') {
					cardSelectionHandler();
				}
			}}
		>
			<div className={'tableberg-pattern-library-card-preview'}>
				<InView>
					{useImagePreview ? (
						<img
							alt={pattern.title}
							className={
								'tableberg-pattern-library-card-preview-image'
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
			<div className={'tableberg-pattern-library-card-info'}>
				<div className={'tableberg-pattern-library-card-info-header'}>
					{pattern.title}
				</div>

				<div
					className={'tableberg-pattern-library-card-info-footer'}
				></div>
			</div>
		</div>
	);
};

export default PatternCard;
