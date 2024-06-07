import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import {
    MenuGroup,
    MenuItem,
    Modal,
    SearchControl,
} from "@wordpress/components";

import TablebergIcon from "@tableberg/shared/icons/tableberg";
import { useSelect } from "@wordpress/data";
interface PatternLibraryProps {
    onClose: () => void;
}

function PatternsLibrary({ onClose }: PatternLibraryProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [pageItems, setPageItems] = useState<any[]>([]);

    const { patterns, categories } = useSelect((select) => {
        const { getBlockPatterns } = select("core") as any;
        const categories: {
            title: string;
            count: number;
        }[] = [];
        const patterns: any[] = [];

        getBlockPatterns()?.forEach((pattern: any) => {
            if (!pattern.name.startsWith("tableberg/")) {
                return;
            }
            patterns.push(pattern);

            pattern.categories.forEach((p_cat: any) => {
                const cat = categories.find((cat) => cat.title == p_cat);
                if (!cat) {
                    categories.push({
                        title: p_cat,
                        count: 1,
                    });
                } else {
                    cat.count++;
                }
            });
        });

        return { patterns, categories };
    }, []);

    useEffect(() => {
        if (!categoryFilter) {
            setPageItems(patterns);
            return;
        }
        const newPage: any = [];
        patterns.forEach((pattern) => {
            if (pattern.categories.indexOf(categoryFilter) > -1) {
                newPage.push(pattern);
            }
        });
        setPageItems(newPage);
    }, [patterns, categoryFilter]);

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
                        {categories.map((cat) => {
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
                        {pageItems.map((pattern) => (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: pattern.content,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default PatternsLibrary;
