import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

interface PostsTableInspectorControlsProps {
	columnIds: string[];
	assignments: Record<string, string>;
	handleAssignment: (columnId: string, value: string) => void;
}

/**
 * Inspector controls for the Posts Table block.
 *
 * @param props                  Component properties.
 * @param props.columnIds        Column ids.
 * @param props.assignments      Assignments for each column.
 * @param props.handleAssignment Function to handle assignment changes.
 */
const PostsTableInspectorControls: React.FC<
	PostsTableInspectorControlsProps
> = ({ columnIds, assignments, handleAssignment }) => {
	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Posts Table Settings', 'tableberg-pro')}>
					{columnIds.map((cId) => (
						<SelectControl
							label={cId}
							key={cId}
							value={assignments[cId] || 'text'}
							options={[
								{
									label: 'Text',
									value: 'text',
								},
								{
									label: 'Date',
									value: 'date',
								},
								{
									label: 'Image',
									value: 'image',
								},
								{
									label: 'Rating',
									value: 'rating',
								},
							]}
							onChange={(value) => handleAssignment(cId, value)}
						/>
					))}
				</PanelBody>
			</InspectorControls>
		</>
	);
};

export default PostsTableInspectorControls;
