import React, { useState, useEffect } from 'react';
import {
	Modal,
	SelectControl,
	CheckboxControl,
	Button,
	Spinner,
} from '@wordpress/components';
import TablebergIcon from '@tableberg/shared/icons/tableberg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

/**
 * Props for the PostsTableModal component.
 *
 * @interface
 */
interface PostsTableModalProps {
	onClose: () => void;
	onCreate: () => void;
}

/**
 * Represents the structure of a post-type object.
 *
 * This interface defines the essential properties associated with a post type for REST API endpoints.
 *
 * @interface
 */
interface PostType {
	name: string;
	slug: string;
	rest_base: string;
}

/**
 * Represents the possible types of properties in a schema definition.
 *
 * The `SchemaPropertyType` defines the allowed data types that can be used
 * for a property within a schema. It restricts the values to a predefined set
 * of types, ensuring consistency and validation within the schema framework.
 *
 * @interface
 */
type SchemaPropertyType = 'string' | 'null' | 'object' | 'integer' | 'array';

/**
 * Represents a property schema retrieved from an API.
 *
 * This interface is used to define the structure of a property within a
 * schema, including its description, type, and optional format.
 *
 * @interface
 */
interface SchemaPropertyFromApi {
	description: string;
	type: SchemaPropertyType | Array<SchemaPropertyType>;
	format?: string;
}

/**
 * The SchemaProperty interface extends SchemaPropertyFromApi and represents
 * a structure for defining schema properties with an additional key field.
 *
 * It is used to represent individual schema properties with a unique key,
 * inheriting any additional fields from SchemaPropertyFromApi.
 *
 * @interface
 */
interface SchemaProperty extends SchemaPropertyFromApi {
	key: string;
}

/**
 * Posts table modal component.
 *
 * This component is used to display the posts table modal on generation phase.
 *
 * @param props          Component props.
 * @param props.onClose  Function to close the modal.
 * @param props.onCreate Callback function when create operation is triggered.
 */
const PostsTableModal: React.FC<PostsTableModalProps> = ({
	onClose,
	onCreate,
}) => {
	// Header for the selection list.
	const selectionHeader = { label: '--Select--', value: '', disabled: true };

	// List of post-types to be excluded from the selection.
	const postTypeBlackList = [
		'menu-items',
		'blocks',
		'templates',
		'template-parts',
		'global-styles',
		'navigation',
		'font-families',
	];

	// List of column types to be excluded from the schema properties.
	const columnTypeBlackList = ['object', 'array'];

	// List of column IDs to be excluded from the schema properties.
	const columnIdBlackList = [
		'password',
		'sticky',
		'template',
		'ping_status',
		'comment_status',
		'modified_gmt',
		'date_gmt',
		'format',
	];

	// State variables for managing the modal's internal state.
	const [selectedPostSlug, setSelectedPostSlug] = useState('');
	const [selectionList, setSelectionList] = useState([selectionHeader]);
	const [schemaProperties, setSchemaProperties] = useState<SchemaProperty[]>(
		[]
	);
	const [selectedColumns, setSelectedColumns] = useState<Array<string>>([]);
	const [modalBusy, setModalBusy] = useState(false);

	const postTypes: Array<PostType> = useSelect((select) => {
		const rawPostTypes = (
			select('core') as {
				getPostTypes: () => Array<{ name: string; rest_base: string }>;
			}
		).getPostTypes();

		// Resolve status for post type store selector.
		const status = (
			select('core/data') as {
				isResolving: (
					targetStore: string,
					selectorId: string
				) => boolean;
			}
		).isResolving('core', 'getPostTypes');
		setModalBusy(status);

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
			const parsedPostTypes = postTypes
				.map((pT) => ({
					label: pT.name,
					value: pT.slug,
					disabled: false,
				}))
				.filter(({ value }) => !postTypeBlackList.includes(value));
			setSelectionList([selectionHeader, ...parsedPostTypes]);
		}
	}, [postTypes]);

	useEffect(() => {
		if (selectedPostSlug) {
			// Clear out any previously selected columns.
			setSelectedColumns([]);

			setModalBusy(true);
			apiFetch({
				path: `wp/v2/${selectedPostSlug}`,
				method: 'OPTIONS',
			})
				.then((resp) => {
					const response = resp as {
						schema?: { properties: Record<string, object> };
					};

					if (response.schema && response.schema.properties) {
						const rawSchemaProperties = response.schema.properties;
						const parsedSchemaProperties = Object.entries(
							rawSchemaProperties
						)
							.map(([key, value]) => {
								const parsedValue =
									value as SchemaPropertyFromApi;
								return {
									key,
									description: parsedValue.description,
									type: parsedValue.type,
									format: parsedValue.format,
								};
							})
							.filter(({ type, key }) => {
								// Filter out unwanted columns.
								const keyFilter =
									!columnIdBlackList.includes(key);

								// Filter out unwanted types.
								let typeToUse = type;
								if (!Array.isArray(typeToUse)) {
									typeToUse = [typeToUse];
								}
								const typeFilter = typeToUse.some(
									(t) => !columnTypeBlackList.includes(t)
								);

								return keyFilter && typeFilter;
							})
							.sort((a, b) => a.key.localeCompare(b.key));

						setSchemaProperties(parsedSchemaProperties);
					}
				})
				.finally(() => {
					setModalBusy(false);
				});
		}
	}, [selectedPostSlug]);

	/**
	 * Handles the change event of a checkbox and updates the list of selected columns accordingly.
	 *
	 * @param columnId The unique identifier of the column associated with the checkbox.
	 * @param status   The new state of the checkbox (true if checked, false if unchecked).
	 */
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

	/**
	 * Handles the creation trigger of the posts table.
	 */
	const handleCreate = () => {
		onCreate();
	};

	return (
		<Modal
			onRequestClose={onClose}
			className={'tableberg-posts-table-modal'}
			__experimentalHideHeader
			size={'medium'}
			bodyOpenClassName={'modal-body'}
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
					{modalBusy && (
						<div className="tableberg-posts-table-modal__main__content__spinner">
							<Spinner />
						</div>
					)}
					<div className="tableberg-posts-table-modal__main__content__post-type">
						<SelectControl
							label="Post Type"
							labelPosition={'side'}
							value={selectedPostSlug}
							onChange={(value) => {
								setSelectedPostSlug(value);
							}}
							options={selectionList}
							disabled={modalBusy}
						/>
					</div>
					{schemaProperties.length > 0 && <h3>Select Columns</h3>}
					<div className="tableberg-posts-table-modal__main__content__schema-properties">
						{schemaProperties.map((p) => (
							<CheckboxControl
								key={p.key}
								label={p.key}
								checked={selectedColumns.includes(p.key)}
								onChange={(val) => {
									handleCheckboxChange(p.key, val);
								}}
								help={p.description}
							/>
						))}
					</div>
				</div>
				<div className="tableberg-posts-table-modal__main__footer">
					<Button
						className="blocks-table__placeholder-button"
						variant="primary"
						onClick={handleCreate}
						type="button"
						disabled={modalBusy && selectedColumns.length === 0}
					>
						Create
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default PostsTableModal;
