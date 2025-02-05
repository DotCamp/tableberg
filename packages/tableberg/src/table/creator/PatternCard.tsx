// @ts-ignore
import { BlockPreview } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';
import { useEffect, useState, type FC, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags } from '@fortawesome/free-solid-svg-icons';
import type Pattern from './includes/Pattern';
import PatternCardPreviewSkeleton from './PatternCardPreviewSkeleton';
import PatternCardTextSkeleton from './PatternCardTextSkeleton';

interface PatternCardProps {
	pattern: Pattern;
	setUpsell: (patternName: string) => void;
	onSelect: (block: BlockInstance) => void;
	isDummy?: boolean;
	useInView?: boolean;
	viewRatio?: number;
}

/**
 * Pattern card component to display pattern related data and operations.
 *
 * @param props                   Component properties.
 * @param props.pattern           Pattern data.
 * @param props.setUpsell         Upsell setter.
 * @param props.onSelect          Pattern selection handler.
 * @param [props.isDummy=false]   Dummy pattern flag. In this mode pattern card will be rendered as a dummy card.
 * @param [props.useInView=false] Flag to enable in view observer to render card contents.
 * @param [props.viewRatio=0.1]   Ratio of the element that needs to be in view to trigger the render. (1.0 being fully in view)
 * @class
 */
const PatternCard: FC<PatternCardProps> = ({
	pattern,
	setUpsell,
	onSelect,
	isDummy = false,
	useInView = false,
	viewRatio = 0.1,
}) => {
	const [useImagePreview, setUseImagePreview] = useState(false);
	const [isBusy, setIsBusy] = useState(true);
	const [isInView, setIsInView] = useState(!useInView);

	// Reference to the wrapper element for in view observer.
	const wrapperRef = useRef(null);

	// Component observer initialization.
	const observer = useMemo(() => {
		return useInView
			? new IntersectionObserver(
					([entry]) => {
						const { isIntersecting } = entry;

						// only update state if element is in view
						if (isIntersecting) {
							setIsInView(isIntersecting);
						}
					},
					{ threshold: viewRatio }
				)
			: null;
	}, [viewRatio]);

	// Start observing the wrapper element for in view operations.
	useEffect(() => {
		if (wrapperRef.current) {
			observer?.observe(wrapperRef.current);
		}
	}, [observer, wrapperRef]);

	// Disconnect observer when component is in view to prevent multiple calls.
	useEffect(() => {
		if (isInView) {
			observer?.disconnect();
		}
	}, [observer, isInView]);

	/**
	 * Handle busy status.
	 *
	 * @param {boolean} status Busy status.
	 */
	const handleBusyStatus = (status: boolean) => {
		setIsBusy(isDummy ? false : status);
	};

	const handleImageError = () => {
		setUseImagePreview(false);
		handleBusyStatus(false);
	};

	const handleImageLoad = () => {
		handleBusyStatus(false);
	};

	const ariaLabelId = `pattern-card-${pattern.name}`;

	/**
	 * Card selection handler.
	 */
	const cardSelectionHandler = () => {
		if (!isBusy && !isDummy) {
			const match = pattern.name.match(/^tableberg\/upsell-(.*)$/);
			if (pattern.isUpsell && match) {
				setUpsell(match[1]);
			} else {
				onSelect(pattern.blocks[0]);
			}
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
				{isBusy && <PatternCardPreviewSkeleton />}
				{!isDummy && (
					<div
						className={
							'tableberg-in-view-wrapper tableberg-pattern-library-card-preview-wrapper'
						}
						ref={wrapperRef}
					>
						{isInView && useImagePreview ? (
							<img
								data-tableberg-preview-loaded={!isBusy}
								alt={pattern.title}
								className={
									'tableberg-pattern-library-card-preview-wrapper-image'
								}
								onError={handleImageError}
								onLoad={handleImageLoad}
								src={pattern.screenshotUrl}
								role={'presentation'}
							/>
						) : (
							<div
								className={
									'tableberg-pattern-library-card-preview-wrapper-block_preview_wrapper'
								}
							>
								<BlockPreview
									blocks={pattern.blocks}
									viewportWidth={pattern.viewportWidth}
								/>
							</div>
						)}
					</div>
				)}
			</div>
			<div className={'tableberg-pattern-library-card-info'}>
				<div className={'tableberg-pattern-library-card-info-header'}>
					<div
						className={
							'tableberg-pattern-library-card-info-header-title'
						}
						id={ariaLabelId}
					>
						{isDummy ? (
							<PatternCardTextSkeleton width={'MEDIUM'} />
						) : (
							pattern.title
						)}
					</div>
					{!isDummy && pattern.isUpsell && (
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
						{!isDummy && (
							<div
								className={
									'tableberg-pattern-library-card-info-footer-tags-icon'
								}
							>
								<FontAwesomeIcon icon={faTags} />
							</div>
						)}
						<div
							className={
								'tableberg-pattern-library-card-info-footer-tags-listing'
							}
						>
							{isDummy ? (
								<PatternCardTextSkeleton width={'SMALL'} />
							) : (
								pattern.categories.join(', ')
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PatternCard;
