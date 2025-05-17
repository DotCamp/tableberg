import React from 'react';
import { Modal } from '@wordpress/components';

interface PostsTableModalProps {
	onClose: () => void;
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
	return (
		<Modal onRequestClose={onClose}>
			<i>here</i>
		</Modal>
	);
};

export default PostsTableModal;
