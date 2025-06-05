import { AssignmentTypeId } from './AssignmentFactory';
import { InnerBlockTemplate } from '@wordpress/blocks';

/**
 * AssignedBlock Class.
 *
 * This class represents a block assigned to a specific column in a posts table.
 */
class AssignedBlock {
	blockId: string;
	assignmentId: AssignmentTypeId;
	propertyKey: string;

	constructor(
		blockId: string,
		assignmentId: AssignmentTypeId,
		propertyKey: string
	) {
		this.blockId = blockId;
		this.assignmentId = assignmentId;
		this.propertyKey = propertyKey;
	}

	/**
	 * Generates a block template for the assigned block.
	 *
	 * @param propertyValue The value to assign to the block property.
	 *
	 * @return A block template array.
	 */
	generateBlockTemplate(
		propertyValue: string | number | boolean
	): InnerBlockTemplate {
		return [
			`${this.blockId}`,
			{
				[this.propertyKey]: propertyValue,
			},
		];
	}
}

export default AssignedBlock;
