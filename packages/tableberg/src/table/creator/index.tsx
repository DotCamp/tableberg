import TablebergIcon from '@tableberg/shared/icons/tableberg';
import {
	AITableIcon,
	DataTableIcon,
	PostsTableIcon,
	PreBuiltTableIcon,
	WooTableIcon,
} from '@tableberg/shared/icons/table-creation';
import { BlockIcon, store } from '@wordpress/block-editor';
import {
	InnerBlockTemplate,
	cloneBlock,
	createBlocksFromInnerBlocksTemplate,
} from '@wordpress/blocks';
import { Button, Flex, Placeholder, TextControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from 'react';
import metadata from '../../block.json';
import PatternsLibrary from './Patterns';

interface Props {
	clientId: string;
	proStatus: boolean;
	currentModal: string | null;
	setModalScreen: (modal: string) => void;
	closeModalScreen: () => void;
}

export default function TableCreator({
	clientId,
	proStatus,
	currentModal,
	setModalScreen,
	closeModalScreen,
}: Props) {
	const storeActions: BlockEditorStoreActions = useDispatch(store) as any;

	const [rows, setRows] = useState<number | undefined>(4);
	const [cols, setCols] = useState<number | undefined>(4);

	const onCreateNew = () => {
		if (!rows || !cols) {
			return;
		}
		if (rows < 1 || cols < 1) {
			return;
		}

		const initialInnerBlocks: InnerBlockTemplate[] = [];
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				initialInnerBlocks.push([
					'tableberg/cell',
					{ row: i, col: j },
					[['core/paragraph']],
				]);
			}
		}

		storeActions.replaceInnerBlocks(
			clientId,
			createBlocksFromInnerBlocksTemplate(initialInnerBlocks)
		);

		storeActions.updateBlockAttributes(clientId, {
			version: metadata.version,
			cells: initialInnerBlocks.length,
			rows,
			cols,
		});
	};

	return (
		<div className="tableberg-table-creator">
			<Placeholder
				label={'Tableberg'}
				icon={<BlockIcon icon={TablebergIcon} />}
			>
				<div className="tableberg-table-creator-heading">
					Create Blank Table
				</div>
				<Flex gap="10px" justify="center" align="end">
					<TextControl
						__nextHasNoMarginBottom
						type="number"
						label={'Column count'}
						value={String(cols)}
						onChange={(count) => {
							setCols(count === '' ? undefined : Number(count));
						}}
						min="1"
						className="blocks-table__placeholder-input"
					/>
					<TextControl
						__nextHasNoMarginBottom
						type="number"
						label={'Row count'}
						value={String(rows)}
						onChange={(count) => {
							setRows(count === '' ? undefined : Number(count));
						}}
						min="1"
						className="blocks-table__placeholder-input"
					/>
					<Button
						className="blocks-table__placeholder-button"
						variant="primary"
						onClick={onCreateNew}
						type="button"
					>
						Create
					</Button>
				</Flex>
				<p className="tableberg-divider">
					<span>or</span>
				</p>
				<div className="tableberg-table-creator-flex">
					<button
						className="tableberg-table-creator-btn"
						onClick={() => setModalScreen('patterns')}
					>
						<div className="tableberg-table-creator-btn-icon">
							{PreBuiltTableIcon}
						</div>
						<span>Pre-Built Table</span>
					</button>
					<button
						className={`tableberg-table-creator-btn ${proStatus ? 'tableberg-pro' : 'tableberg-pro-locked'}`}
						onClick={() => proStatus && setModalScreen('patterns')}
					>
						<div className="tableberg-table-creator-btn-icon">
							{PostsTableIcon}
						</div>
						<span>Posts Table</span>
					</button>
					<button className="tableberg-table-creator-btn tableberg-upcoming">
						<div className="tableberg-table-creator-btn-icon">
							{DataTableIcon}
						</div>
						<span>Data Table (CSV, XML)</span>
					</button>
					<button className="tableberg-table-creator-btn tableberg-upcoming">
						<div className="tableberg-table-creator-btn-icon">
							{WooTableIcon}
						</div>
						<span>WooCommerce Table</span>
					</button>
					<button className="tableberg-table-creator-btn tableberg-upcoming">
						<div className="tableberg-table-creator-btn-icon">
							{AITableIcon}
						</div>
						<span>AI Table</span>
					</button>
				</div>
			</Placeholder>
			{currentModal === 'patterns' && (
				<PatternsLibrary
					onClose={() => closeModalScreen()}
					onSelect={(b) =>
						storeActions.replaceBlock(clientId, cloneBlock(b))
					}
				/>
			)}
		</div>
	);
}
