import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import {
	MenuGroup,
	MenuItem,
	Modal,
	SearchControl,
} from '@wordpress/components';

// @ts-ignore
import { store } from '@wordpress/block-editor';

import TablebergIcon from '@tableberg/shared/icons/tableberg';
import { useSelect } from '@wordpress/data';
import type { BlockInstance } from '@wordpress/blocks';

import { UpsellPatternsModal } from '../../components/UpsellModal';
import { createPortal } from 'react-dom';
import PatternCard from './PatternCard';
import Pattern, { PatternOptions } from './includes/Pattern';

interface PatternLibraryProps {
	onClose: () => void;
	onSelect: (block: BlockInstance) => void;
}

function PatternsLibrary({ onClose, onSelect }: PatternLibraryProps) {
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');

	const populateDummyCards = (amount = 4) => {
		const dummyPatterns: Pattern[] = [];
		for (let i = 0; i < amount; i++) {
			const dummyPattern = new Pattern({
				name: `tableberg/dummy-${i}`,
				title: `Dummy ${i}`,
				isUpsell: false,
				blocks: [],
				viewportWidth: 0,
				tablebergPatternScreenshot: '',
				categories: ['tableberg'],
				categorySlugs: ['tableberg'],
			});
			dummyPatterns.push(dummyPattern);
		}

		return dummyPatterns;
	};

	const [pageItems, setPageItems] = useState<readonly Pattern[]>(
		populateDummyCards(6)
	);
	const [useDummies, setUseDummies] = useState(true);

	const [upsell, setUpsell] = useState<string | null>(null);

	const { categories, patterns } = useSelect((select) => {
		// @ts-ignore
		const { __experimentalGetAllowedPatterns, getSettings } = select(store);
		const { __experimentalBlockPatternCategories } = getSettings();

		const catTitleMap = new Map<string, string>();
		__experimentalBlockPatternCategories.forEach((cat: any) => {
			catTitleMap.set(cat.name, cat.label);
		});

		const patternCategories: {
			slug: string;
			title: string;
			count: number;
		}[] = [];
		const availablePatterns: Pattern[] = [];

		__experimentalGetAllowedPatterns().forEach((pattern: any) => {
			if (!pattern.name.startsWith('tableberg/')) {
				return;
			}

			pattern.isUpsell = pattern.name.indexOf('/upsell-') > -1;
			const {
				name,
				title,
				isUpsell,
				blocks,
				viewportWidth,
				tablebergPatternScreenshot,
				categories: categorySlugs,
			}: PatternOptions = pattern;

			availablePatterns.push(
				new Pattern({
					name,
					title,
					isUpsell,
					blocks,
					viewportWidth,
					tablebergPatternScreenshot,
					categories: categorySlugs.map((cSlug: string) => {
						const targetCatLabel = catTitleMap.get(cSlug);
						return targetCatLabel ?? cSlug;
					}),
					categorySlugs,
				})
			);

			pattern.categories.forEach((pCat: any) => {
				if (pCat === 'tableberg') {
					return;
				}
				const cat = patternCategories.find(
					(fCat) => fCat.slug === pCat
				);
				if (!cat) {
					patternCategories.push({
						slug: pCat,
						title: catTitleMap.get(pCat) || pCat,
						count: 1,
					});
				} else {
					cat.count++;
				}
			});
		});

		return {
			patterns: availablePatterns,
			categories: patternCategories,
		};
	}, []);

	useEffect(() => {
		if (patterns.length) {
			setUseDummies(false);
			const newPage: any = [];
			patterns.forEach((pattern: any) => {
				if (
					(categoryFilter
						? pattern.categorySlugs.includes(categoryFilter)
						: true) &&
					pattern.title.toLowerCase().includes(search.toLowerCase())
				) {
					newPage.push(pattern);
				}
			});
			setPageItems(newPage);
		}
	}, [patterns, categoryFilter, search]);

	return (
		<Modal
			isFullScreen
			className="tableberg-pattern-library"
			onRequestClose={onClose}
			__experimentalHideHeader
		>
			<div className="tableberg-pattern-library-modal">
				<div className="tableberg-pattern-library-sidebar">
					<div className="tableberg-pattern-library-sidebar-header">
						{TablebergIcon} <h2>Tableberg</h2>
					</div>
					<MenuGroup className="tableberg-pattern-library-types">
						<MenuItem
							key={''}
							className="tableberg_icons_library_sidebar_item"
							// @ts-ignore
							isPressed={categoryFilter === ''}
							onClick={() => {
								setCategoryFilter('');
							}}
						>
							<span>All</span>
						</MenuItem>
						{categories.map((cat) => {
							return (
								<MenuItem
									key={cat.slug}
									className="tableberg_icons_library_sidebar_item"
									// @ts-ignore
									isPressed={categoryFilter === cat.slug}
									onClick={() => {
										setCategoryFilter(cat.slug);
									}}
								>
									<span>{cat?.title}</span>
									<span>{cat?.count}</span>
								</MenuItem>
							);
						})}
					</MenuGroup>
				</div>
				<div className="tableberg-pattern-library-content">
					<div className="tableberg-pattern-library-content-header">
						<span>Search</span>
						<SearchControl
							value={search}
							onChange={setSearch}
							size="compact"
							placeholder=""
						/>
						<button onClick={onClose}>
							<FontAwesomeIcon icon={faClose} />
						</button>
					</div>
					<div className="tableberg-pattern-library-body">
						<div
							role={'grid'}
							className="tableberg-pattern-library-grid"
						>
							{pageItems.map((pattern) => (
								<PatternCard
									key={pattern.name}
									pattern={pattern}
									setUpsell={setUpsell}
									onSelect={onSelect}
									isDummy={useDummies}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
			{upsell &&
				createPortal(
					<UpsellPatternsModal
						onClose={() => setUpsell(null)}
						selected={upsell}
					/>,
					document.body
				)}
		</Modal>
	);
}

export default PatternsLibrary;
