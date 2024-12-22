import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MenuGroup, MenuItem, Modal } from '@wordpress/components';

import TablebergIcon from '@tableberg/shared/icons/tableberg';
import { BlockInstance, parse } from '@wordpress/blocks';
import { debounce } from '@wordpress/compose';

import { UpsellPatternsModal } from '../../components/UpsellModal';
import PatternCard from './PatternCard';
import Pattern, { PatternOptions } from './includes/Pattern';
import PatternSearchControl from './PatternSearchControl';
import apiFetch from '@wordpress/api-fetch';

interface PatternLibraryProps {
	onClose: () => void;
	onSelect: (block: BlockInstance) => void;
}

function PatternsLibrary({ onClose, onSelect }: PatternLibraryProps) {
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');
	const [categories, setCategories] = useState<
		{ slug: string; title: string; count: number }[]
	>([]);
	const [patterns, setPatterns] = useState<Pattern[]>([]);

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

	const handleSetSearch = debounce((val) => setSearch(val as string), 300);

	useEffect(() => {
		const preparePatternsAndCategories = async () => {
			const availablePatternCategories = (await apiFetch({
				path: '/wp/v2/block-patterns/categories',
			})) as { name: string; label: string }[];

			const availablePatterns = (await apiFetch({
				path: '/wp/v2/block-patterns/patterns',
			})) as PatternOptions[];

			const catTitleMap = new Map<string, string>();
			availablePatternCategories.forEach(({ name, label }) => {
				catTitleMap.set(name, label);
			});

			const patternCategories: {
				slug: string;
				title: string;
				count: number;
			}[] = [];

			const tablebergPatterns = availablePatterns.reduce(
				(carry: Pattern[], pattern: any) => {
					if (pattern.name.startsWith('tableberg/')) {
						pattern.isUpsell =
							pattern.name.indexOf('/upsell-') > -1;

						// Since we are gathering patterns from the REST API, we need to parse the blocks content.
						// And also we need to change some properties to match the Pattern class properties.
						pattern.blocks = parse(pattern.content);
						pattern.viewportWidth = pattern.viewport_width;

						const {
							name,
							title,
							isUpsell,
							blocks,
							viewportWidth,
							tablebergPatternScreenshot,
							categories: categorySlugs,
						}: PatternOptions = pattern;

						carry.push(
							new Pattern({
								name,
								title,
								isUpsell,
								blocks,
								viewportWidth,
								tablebergPatternScreenshot,
								categories: categorySlugs.map(
									(cSlug: string) => {
										const targetCatLabel =
											catTitleMap.get(cSlug);
										return targetCatLabel ?? cSlug;
									}
								),
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
					}
					return carry;
				},
				[]
			);
			setCategories(patternCategories);
			setPatterns(tablebergPatterns);
		};

		preparePatternsAndCategories();
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
						<PatternSearchControl onChange={handleSetSearch} />
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
