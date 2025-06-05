import AssignedBlock from './AssignedBlock';

export type AssignmentTypeId = 'text' | 'image' | 'rating';

interface AssignmentType {
	label: string;
	id: AssignmentTypeId;
}

// List of available assignment types.
const availableAssignmentTypes: Array<AssignmentType> = [
	{ label: 'text', id: 'text' },
	{ label: 'image', id: 'image' },
	{ label: 'star rating', id: 'rating' },
];

// List of assigned blocks with their properties.
const assignmentBlocks: Array<AssignedBlock> = [
	new AssignedBlock('core/paragraph', 'text', 'content'),
	new AssignedBlock('core/image', 'image', 'imageId'),
	new AssignedBlock('tableberg/star-rating', 'rating', 'selectedStars'),
];

/**
 * AssignmentFactory.
 *
 * This factory generates block templates based on the assignment type.
 */
class AssignmentFactory {
	defaultAssignmentType: AssignmentTypeId;
	blockAssignments: Array<AssignedBlock>;
	assignmentTypes: Array<AssignmentType>;

	constructor(
		blockAssignments: Array<AssignedBlock>,
		assignmentTypes: Array<AssignmentType> = availableAssignmentTypes,
		defaultAssignmentType: AssignmentTypeId = 'text'
	) {
		this.defaultAssignmentType = defaultAssignmentType;
		this.blockAssignments = blockAssignments;
		this.assignmentTypes = assignmentTypes;
	}

	/**
	 * Generates a block template for the given assignment ID.
	 *
	 * @param assignmentId  Assignment id.
	 * @param propertyValue Target property value
	 *
	 * @return A block template array.
	 */
	generateBlock = (
		assignmentId: AssignmentTypeId,
		propertyValue: string | number | boolean
	) => {
		let assignmentBlock = this.blockAssignments.find(
			(block) => block.assignmentId === assignmentId
		) as AssignedBlock;

		if (!assignmentBlock) {
			assignmentBlock = this.blockAssignments.find(
				(block) => block.assignmentId === this.defaultAssignmentType
			) as AssignedBlock;
		}

		return assignmentBlock.generateBlockTemplate(propertyValue);
	};

	/**
	 * Returns the list of available assignment types.
	 *
	 * @return Available assignment types.
	 */
	getAvailableAssignmentTypes = (): Array<AssignmentType> => {
		return this.assignmentTypes;
	};
}

export default new AssignmentFactory(assignmentBlocks);
