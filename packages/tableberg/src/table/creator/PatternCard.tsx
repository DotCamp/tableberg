import classNames from 'classnames';
import { Spinner } from '@wordpress/components';
import InView from '../../components/InView';
// @ts-ignore
import { BlockPreview } from '@wordpress/block-editor';
import type { BlockInstance } from '@wordpress/blocks';
import { useEffect, useState } from 'react';

interface PatternData {
	name: string;
	title: string;
	isUpsell: boolean;
	blocks: BlockInstance[];
	viewportWidth: number;
	tablebergPatternScreenshot: false | string;
}

interface PatternCardProps {
	pattern: PatternData;
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

	useEffect(() => {
		setUseImagePreview(pattern.tablebergPatternScreenshot !== false);
	}, [pattern]);

	return (
		<div
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
			<div className="tableberg-pattern-library-preview-item">
				<div className={'tableberg-pattern-library-preview-item-busy'}>
					<Spinner
						style={{
							width: '50px',
							height: '50px',
						}}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					/>
				</div>
				<InView>
					{useImagePreview ? (
						<div>image</div>
					) : (
						<BlockPreview
							blocks={pattern.blocks}
							viewportWidth={pattern.viewportWidth}
						/>
					)}
				</InView>
			</div>
			<p>{pattern.title}</p>
		</div>
	);
};

export default PatternCard;
