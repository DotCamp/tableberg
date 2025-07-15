import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import blocks, { ENHANCED_FEATURES } from "@tableberg/shared/blocks";
import blockIcon from "@tableberg/shared/icons/tableberg";
import { PATTERN_UPSELLS } from "./patterns";

const IMAGE_BASE = TABLEBERG_CFG.plugin_url + "includes/Admin/images/upsell/";

const proBlocks = blocks.filter((b: any) => b.isPro);

PATTERN_UPSELLS.forEach((p) => {
    p.image = `${TABLEBERG_CFG.plugin_url}${p.image.substring(1)}`;
    // @ts-ignore
    proBlocks.push(p);
});

interface Props {
    onClose: () => void;
    selected?: string;
    link?: string;
}

export interface BlockUpsellInfo {
    icon: any;
    title: string;
    name: string;
    image?: string;
    upsellText?: string;
}
interface ComponentProps {
    onClose: () => void;
    info: BlockUpsellInfo;
    prev?: () => void;
    next?: () => void;
    link?: string;
}

export function UpsellModalComponent({
    onClose,
    info,
    prev,
    next,
    link = "https://tableberg.com/pricing/",
}: ComponentProps) {
    return (
        <div className="tableberg-upsell-modal">
            <div
                className="tableberg-upsell-modal-backdrop"
                onClick={onClose}
            ></div>
            <div className="tableberg-upsell-modal-container">
                {!!prev && (
                    <button
                        className="tableberg-upsell-modal-prev"
                        onClick={prev}
                    >
                        <FontAwesomeIcon icon={faCaretLeft} />
                    </button>
                )}
                <div className="tableberg-upsell-modal-area" key={info.name}>
                    <h2>
                        {info.icon || blockIcon} {info.title}
                    </h2>
                    <div className="tableberg-upsell-modal-content">
                        {info.image && (
                            <img
                                src={
                                    info.image.startsWith("http")
                                        ? info.image
                                        : IMAGE_BASE + info.image
                                }
                                alt={info.title + " Demo"}
                            />
                        )}
                        {info.upsellText && (
                            <p
                                className="tableberg-upsell-modal-text"
                                dangerouslySetInnerHTML={{
                                    __html: info.upsellText,
                                }}
                            />
                        )}
                        <p>
                            Limited Time: Use code <b>TB20</b> to get a 20%
                            discount.
                        </p>
                    </div>
                    <div className="tableberg-upsell-modal-footer">
                        <button onClick={onClose}>Cancel</button>
                        <a
                            href={link}
                            target="_blank"
                        >
                            Buy PRO
                        </a>
                    </div>
                </div>
                {!!next && (
                    <button
                        className="tableberg-upsell-modal-next"
                        onClick={next}
                    >
                        <FontAwesomeIcon icon={faCaretRight} />
                    </button>
                )}
            </div>
        </div>
    );
}

export function UpsellEnhancedModal({ onClose, selected, link = "https://tableberg.com/pricing/" }: Props) {
    const [idx, setIdx] = useState(0);
    const info = ENHANCED_FEATURES[idx];

    useEffect(() => {
        if (selected) {
            selected = selected.replace("-dummy", "");
            const idx = ENHANCED_FEATURES.findIndex((b) => b.name === selected);
            if (idx > -1) {
                setIdx(idx);
            }
        }
    }, [selected]);

    const prev = () =>
        setIdx((idx) => {
            if (idx > 0) {
                return idx - 1;
            }
            return ENHANCED_FEATURES.length - 1;
        });

    const next = () => setIdx((idx + 1) % ENHANCED_FEATURES.length);

    return (
        <UpsellModalComponent
            onClose={onClose}
            info={info}
            prev={prev}
            next={next}
            link={link}
        />
    );
}

export function UpsellPatternsModal({ onClose, selected }: Props) {
    const [idx, setIdx] = useState(0);
    const info = PATTERN_UPSELLS[idx];

    useEffect(() => {
        if (selected) {
            const idx = PATTERN_UPSELLS.findIndex((b) => b.name === selected);
            if (idx > -1) {
                setIdx(idx);
            }
        }
    }, [selected]);

    const prev = () =>
        setIdx((idx) => {
            if (idx > 0) {
                return idx - 1;
            }
            return PATTERN_UPSELLS.length - 1;
        });

    const next = () => setIdx((idx + 1) % PATTERN_UPSELLS.length);

    return (
        <UpsellModalComponent
            onClose={onClose}
            info={info as any}
            prev={prev}
            next={next}
        />
    );
}

export default function UpsellModal({ onClose, selected }: Props) {
    const [idx, setIdx] = useState(0);
    const info = proBlocks[idx];

    useEffect(() => {
        if (selected) {
            selected = selected.replace("-dummy", "");
            const idx = proBlocks.findIndex((b) => b.name === selected);
            if (idx > -1) {
                setIdx(idx);
            }
        }
    }, [selected]);

    const prev = () =>
        setIdx((idx) => {
            if (idx > 0) {
                return idx - 1;
            }
            return proBlocks.length - 1;
        });

    const next = () => setIdx((idx + 1) % proBlocks.length);

    return (
        <UpsellModalComponent
            onClose={onClose}
            info={info}
            prev={prev}
            next={next}
        />
    );
}
