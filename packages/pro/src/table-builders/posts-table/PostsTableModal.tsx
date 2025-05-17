import React from 'react';
import { Modal } from '@wordpress/components';
import TablebergIcon from '@tableberg/shared/icons/tableberg';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";

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
				</div>
			</div>
		</Modal>
	);
};

export default PostsTableModal;
