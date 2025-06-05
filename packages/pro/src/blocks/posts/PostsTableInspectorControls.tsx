import React, { useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import { AssignmentType } from './inc/AssignmentFactory';

interface PostsTableInspectorControlsProps {
	columnIds: string[];
	assignments: Record<string, string>;
	handleAssignment: (columnId: string, value: string) => void;
	assignmentTypeList: Array<AssignmentType>;
}

/**
 * Inspector controls for the Posts Table block.
 *
 * @param props                    Component properties.
 * @param props.columnIds          Column ids.
 * @param props.assignments        Assignments for each column.
 * @param props.assignmentTypeList List of available assignment types.
 * @param props.handleAssignment   Function to handle assignment changes.
 */
const PostsTableInspectorControls: React.FC<
	PostsTableInspectorControlsProps
> = ({ columnIds, assignments, assignmentTypeList, handleAssignment }) => {
	const assignmentTypes = useMemo(() => {
		return assignmentTypeList.map((type) => ({
			label: type.label
				.split(' ')
				.map(
					(labelPart) =>
						labelPart.charAt(0).toUpperCase() + labelPart.slice(1)
				)
				.join(' '),
			value: type.id,
		}));
	}, [assignmentTypeList]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Posts Table Settings', 'tableberg-pro')}>
					{columnIds.map((cId) => (
						<SelectControl
							label={cId}
							key={cId}
							value={assignments[cId] || 'text'}
							options={assignmentTypes}
							onChange={(value) => handleAssignment(cId, value)}
						/>
					))}
				</PanelBody>
			</InspectorControls>
		</>
	);
};

export default PostsTableInspectorControls;
