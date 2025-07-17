import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

interface CustomModalProps {
    title: string;
    onRequestClose: () => void;
    className?: string;
    isDismissible?: boolean;
    shouldCloseOnClickOutside?: boolean;
    children: React.ReactNode;
}

export default function CustomModal({
    title,
    onRequestClose,
    className = "",
    isDismissible = true,
    shouldCloseOnClickOutside = true,
    children,
}: CustomModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Store the previously focused element
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Focus the modal
        if (modalRef.current) {
            modalRef.current.focus();
        }

        // Prevent body scrolling
        document.body.style.overflow = "hidden";

        // Handle ESC key
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isDismissible) {
                onRequestClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            // Restore body scrolling
            document.body.style.overflow = "";
            
            // Restore focus to previous element
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
            
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isDismissible, onRequestClose]);

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (shouldCloseOnClickOutside && isDismissible && event.target === event.currentTarget) {
            onRequestClose();
        }
    };

    const modalContent = (
        <div
            className={`tableberg-custom-modal-backdrop ${className}`}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className="tableberg-custom-modal-container"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="tableberg-custom-modal-header">
                    <h2 id="modal-title" className="tableberg-custom-modal-title">
                        {title}
                    </h2>
                    {isDismissible && (
                        <Button
                            variant="tertiary"
                            onClick={onRequestClose}
                            className="tableberg-custom-modal-close"
                            aria-label={__("Close modal", "tableberg")}
                        >
                            ×
                        </Button>
                    )}
                </div>
                <div className="tableberg-custom-modal-content">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}