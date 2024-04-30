import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
// @ts-ignore
import blocks from "../../../admin/src/data/blocks.js";

const proBlocks: {
    name: string;
    title: string;
    icon: any;
    image: string;
    upsellText: string;
}[] = blocks.filter((b: any) => b.isPro);

export default function UpsellModal({ onClose }: { onClose: () => void }) {
    const [idx, setIdx] = useState(0);
    const info = proBlocks[idx];

    const prev = () =>
        setIdx((idx) => {
            if (idx > 0) {
                return idx - 1;
            }
            return proBlocks.length - 1;
        });

    return (
        <div className="tableberg-upsell-modal">
            <div className="tableberg-upsell-modal-backdrop"></div>
            <div className="tableberg-upsell-modal-container">
                <button className="tableberg-upsell-modal-prev" onClick={prev}>
                    <FontAwesomeIcon icon={faCaretLeft} />
                </button>
                <div className="tableberg-upsell-modal-area" key={info.name}>
                    <h2>
                        {info.icon} {info.title}
                    </h2>
                    <div className="tableberg-upsell-modal-content">
                        <img src={info.image} alt={info.title + " Demo"} />
                        <p>{info.upsellText}</p>
                        <p>
                            Limited Time: Use code <b>TB10</b> to get a 10%
                            discount.
                        </p>
                    </div>
                    <div className="tableberg-upsell-modal-footer">
                        <button onClick={onClose}>Cancel</button>
                        <a href="https://tableberg.com/pricing/">Buy PRO</a>
                    </div>
                </div>
                <button
                    className="tableberg-upsell-modal-next"
                    onClick={() => setIdx((idx + 1) % proBlocks.length)}
                >
                    <FontAwesomeIcon icon={faCaretRight} />
                </button>
            </div>
        </div>
    );
}
