import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

const PostsTableInspectorControls: React.FC = ({
	columnIds,
	assignments,
	handleAssignment,
}) => {
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
