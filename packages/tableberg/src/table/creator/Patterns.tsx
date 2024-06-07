import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import {
    MenuGroup,
    MenuItem,
    Modal,
    SearchControl,
} from "@wordpress/components";

import TablebergIcon from "@tableberg/shared/icons/tableberg";
interface PatternLibraryProps {
    onClose: () => void;
}

const PATTERNT_TYPES = [
    {
        title: "Primary",
        count: 0,
    },
    {
        title: "Stack Row",
        count: 0,
    },
    {
        title: "Stack Col",
        count: 0,
    },
];

function PatternsLibrary({ onClose }: PatternLibraryProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    return (
        <Modal
            isFullScreen
            className="tableberg-pattern-library"
            onRequestClose={onClose}
            __experimentalHideHeader
        >
            <div className="tableberg-pattern-library-modal">
                <div className="tableberg-pattern-library-sidebar">
                    <div className="tableberg-pattern-library-sidebar-header">
                        {TablebergIcon} <h2>Tableberg</h2>
                    </div>
                    <MenuGroup className="tableberg-pattern-library-types">
                        <MenuItem
                            key={""}
                            className="tableberg_icons_library_sidebar_item"
                            // @ts-ignore
                            isPressed={categoryFilter === ""}
                            onClick={() => {
                                setCategoryFilter("");
                            }}
                        >
                            <span>All</span>
                        </MenuItem>
                        {PATTERNT_TYPES.map((cat) => {
                            return (
                                <MenuItem
                                    key={cat.title}
                                    className="tableberg_icons_library_sidebar_item"
                                    // @ts-ignore
                                    isPressed={categoryFilter === cat.title}
                                    onClick={() => {
                                        setCategoryFilter(cat.title);
                                    }}
                                >
                                    <span>{cat?.title}</span>
                                    <span>{cat?.count}</span>
                                </MenuItem>
                            );
                        })}
                    </MenuGroup>
                </div>
                <div className="tableberg-pattern-library-content">
                    <div className="tableberg-pattern-library-content-header">
                        <span>Search</span>
                        <SearchControl
                            value={search}
                            onChange={setSearch}
                            size="compact"
                            placeholder=""
                        />
                        <button onClick={onClose}>
                            <FontAwesomeIcon icon={faClose} />
                        </button>
                    </div>
                    <div className="tableberg-pattern-library-body">
                        
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default PatternsLibrary;
