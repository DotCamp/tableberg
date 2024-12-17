import InView from '../../components/InView';
// @ts-ignore
import { BlockPreview } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';
import { useEffect, useState, type FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags } from '@fortawesome/free-solid-svg-icons';
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

	const ariaLabelId = `pattern-card-${pattern.name}`;

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
			aria-labelledby={ariaLabelId}
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
				<InView
					classNames={[
						'tableberg-pattern-library-card-preview-image_wrapper',
					]}
				>
					{useImagePreview ? (
						<img
							alt={pattern.title}
							className={
								'tableberg-pattern-library-card-preview-image_wrapper-image'
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
					<div
						className={
							'tableberg-pattern-library-card-info-header-title'
						}
						id={ariaLabelId}
					>
						{pattern.title}
					</div>
					{pattern.isUpsell && (
						<div
							className={
								'tableberg-pattern-library-card-info-header-pro'
							}
						>
							PRO
						</div>
					)}
				</div>
				<div className={'tableberg-pattern-library-card-info-footer'}>
					<div
						className={
							'tableberg-pattern-library-card-info-footer-tags'
						}
					>
						<div
							className={
								'tableberg-pattern-library-card-info-footer-tags-icon'
							}
						>
							<FontAwesomeIcon icon={faTags} />
						</div>
						<div
							className={
								'tableberg-pattern-library-card-info-footer-tags-listing'
							}
						>
							{pattern.categories.join(', ')}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PatternCard;
