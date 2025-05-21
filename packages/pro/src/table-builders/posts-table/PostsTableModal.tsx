import React, { useState, useEffect } from 'react';
import {
	Modal,
	SelectControl,
	CheckboxControl,
	Button,
} from '@wordpress/components';
import TablebergIcon from '@tableberg/shared/icons/tableberg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

interface PostsTableModalProps {
	onClose: () => void;
}

interface PostType {
	name: string;
	slug: string;
	rest_base: string;
}

/**
 * Posts table modal component.
 *
 * This component is used to display the posts table modal on generation phase.
 *
 * @param props         Component props.
 * @param props.onClose Function to close the modal.
 */
const PostsTableModal: React.FC<PostsTableModalProps> = ({ onClose }) => {
	const selectionHeader = { label: '--Select--', value: '', disabled: true };

	const [selectedPostSlug, setSelectedPostSlug] = useState('');
	const [selectionList, setSelectionList] = useState([selectionHeader]);
	const [schemaProperties, setSchemaProperties] = useState<string[]>([]);
	const [selectedColumns, setSelectedColumns] = useState<Array<string>>([]);

	const postTypes: Array<PostType> = useSelect((select) => {
		const rawPostTypes = (
			select('core') as { getPostTypes: () => any[] }
		).getPostTypes();

		/* eslint-disable camelcase */
		return rawPostTypes
			? rawPostTypes.map(({ name, rest_base }) => ({
					name,
					slug: rest_base,
					rest_base,
				}))
			: [];
		/* eslint-enable camelcase */
	}, []);

	useEffect(() => {
		if (postTypes.length) {
			const parsedPostTypes = postTypes.map((pT) => ({
				label: pT.name,
				value: pT.slug,
				disabled: true,
			}));
			setSelectionList([selectionHeader, ...parsedPostTypes]);
		}
	}, [postTypes]);

	useEffect(() => {
		if (selectedPostSlug) {
			apiFetch({
				path: `wp/v2/${selectedPostSlug}`,
				method: 'OPTIONS',
			}).then((resp) => {
				const response = resp as {
					schema: { properties: Record<string, unknown> };
				};
				const rawSchemaProperties = response.schema.properties;
				const parsedSchemaProperties = Object.keys(rawSchemaProperties);

				setSchemaProperties(parsedSchemaProperties);
			});
		}
	}, [selectedPostSlug]);

	const handleCheckboxChange = (columnId: string, status: boolean) => {
		const currentSelectedColumns = [...selectedColumns];
		if (status) {
			currentSelectedColumns.push(columnId);
		} else {
			const index = currentSelectedColumns.indexOf(columnId);
			if (index > -1) {
				currentSelectedColumns.splice(index, 1);
			}
		}
		setSelectedColumns(currentSelectedColumns);
	};

	return (
		<Modal
			onRequestClose={onClose}
			className={'tableberg-posts-table-modal'}
			__experimentalHideHeader
			size={'medium'}
		>
			<div className="tableberg-posts-table-modal__main">
				<div className="tableberg-posts-table-modal__main__header">
					<div className="tableberg-posts-table-modal__main__header__logo">
						{TablebergIcon} <h2>Tableberg Posts Table</h2>
					</div>
					<div className="tableberg-posts-table-modal__main__header__close">
						<button onClick={onClose}>
							<FontAwesomeIcon icon={faClose} />
						</button>
					</div>
				</div>
				<div className="tableberg-posts-table-modal__main__content">
					<div className="tableberg-posts-table-modal__main__content__post-type">
						<SelectControl
							label="Post Type"
							labelPosition={'side'}
							value={selectedPostSlug}
							onChange={(value) => {
								setSelectedPostSlug(value);
							}}
							options={selectionList}
						/>
					</div>
					{schemaProperties.length > 0 && <h3>Select Columns</h3>}
					<div className="tableberg-posts-table-modal__main__content__schema-properties">
						{schemaProperties.map((p) => (
							<CheckboxControl
								key={p}
								label={p}
								checked={selectedColumns.includes(p)}
								onChange={(val) => {
									handleCheckboxChange(p, val);
								}}
							/>
						))}
					</div>
					{schemaProperties.length > 0 && (
						<Button
							className="blocks-table__placeholder-button"
							variant="primary"
							onClick={() => {}}
							type="button"
						>
							Create
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
};

export default PostsTableModal;
