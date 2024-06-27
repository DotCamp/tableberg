import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import {
    MenuGroup,
    MenuItem,
    Modal,
    SearchControl,
} from "@wordpress/components";

// @ts-ignore
import { BlockPreview, store } from "@wordpress/block-editor";

import TablebergIcon from "@tableberg/shared/icons/tableberg";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { BlockInstance } from "@wordpress/blocks";
import classNames from "classnames";
interface PatternLibraryProps {
    onClose: () => void;
    onSelect: (block: BlockInstance) => void;
}

const theDiv = document.createElement("div");

function PatternsLibrary({ onClose, onSelect }: PatternLibraryProps) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [pageItems, setPageItems] = useState<any[]>([]);

    const { categories, patterns } = useSelect((select) => {
        // @ts-ignore
        const { __experimentalGetAllowedPatterns, getSettings } = select(store);
        const { __experimentalBlockPatternCategories } = getSettings();

        const catTitleMap = new Map<string, string>();
        __experimentalBlockPatternCategories.forEach((cat: any) => {
            catTitleMap.set(cat.name, cat.label);
        });

        const categories: { slug: string; title: string; count: number }[] = [];
        const patterns: any[] = [];

        __experimentalGetAllowedPatterns().forEach((pattern: any) => {
            if (!pattern.name.startsWith("tableberg/")) {
                return;
            }
            pattern.isUpsell = pattern.name.indexOf("-upsell-") > -1;

            patterns.push(pattern);

            pattern.categories.forEach((p_cat: any) => {
                if (p_cat === "tableberg") {
                    return;
                }
                const cat = categories.find((cat) => cat.slug == p_cat);
                if (!cat) {
                    categories.push({
                        slug: p_cat,
                        title: catTitleMap.get(p_cat) || p_cat,
                        count: 1,
                    });
                } else {
                    cat.count++;
                }
            });
        });

        return {
            patterns,
            categories,
        };
    }, []);

    useEffect(() => {
        if (!categoryFilter) {
            setPageItems(patterns);
            return;
        }
        const newPage: any = [];
        patterns.forEach((pattern: any) => {
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
                                    key={cat.slug}
                                    className="tableberg_icons_library_sidebar_item"
                                    // @ts-ignore
                                    isPressed={categoryFilter === cat.slug}
                                    onClick={() => {
                                        setCategoryFilter(cat.slug);
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
                        <div className="tableberg-pattern-library-grid">
                            {pageItems.map((pattern) => (
                                <div
                                    className={classNames({
                                        "tableberg-pattern-library-preview":
                                            true,
                                        "tableberg-pattern-library-preview-upsell":
                                            pattern.isUpsell,
                                    })}
                                    onClick={() =>
                                        pattern.blocks &&
                                        onSelect(pattern.blocks[0])
                                    }
                                >
                                    <div className="tableberg-pattern-library-preview-item">
                                        <BlockPreview
                                            blocks={pattern.blocks}
                                            viewportWidth={
                                                pattern.viewportWidth
                                            }
                                        />
                                    </div>
                                    <p>{pattern.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default PatternsLibrary;
