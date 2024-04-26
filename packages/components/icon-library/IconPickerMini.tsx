import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useState } from "react";

import { tablebergIcons } from "./icons";
import { Button, SearchControl } from "@wordpress/components";
import { isEmpty } from "lodash";

interface Props {
    onSelect: (icon: any) => void;
    maxHeight?: string;
}

const ALL_ICONS: Array<any> = [];

tablebergIcons.forEach((pack: any) => {
    pack.icons.forEach((icon: any) => {
        ALL_ICONS.push(icon);
    });
});

const stringDistance = (function () {
    // Algorithm: https://github.com/gustf/js-levenshtein/blob/master/index.js
    // @ts-ignore
    function _min(d0, d1, d2, bx, ay) {
        return d0 < d1 || d2 < d1
            ? d0 > d2
                ? d2 + 1
                : d0 + 1
            : bx === ay
            ? d1
            : d1 + 1;
    }

    return function (a: string, b: string) {
        if (a === b) {
            return 0;
        }

        if (a.length > b.length) {
            let tmp = a;
            a = b;
            b = tmp;
        }

        let la = a.length;
        let lb = b.length;

        while (la > 0 && a.charCodeAt(la - 1) === b.charCodeAt(lb - 1)) {
            la--;
            lb--;
        }

        let offset = 0;

        while (offset < la && a.charCodeAt(offset) === b.charCodeAt(offset)) {
            offset++;
        }

        la -= offset;
        lb -= offset;

        if (la === 0 || lb < 3) {
            return lb;
        }

        let x = 0;
        let y;
        let d0;
        let d1;
        let d2;
        let d3;
        let dd;
        let dy;
        let ay;
        let bx0;
        let bx1;
        let bx2;
        let bx3;

        let vector = [];

        for (y = 0; y < la; y++) {
            vector.push(y + 1);
            vector.push(a.charCodeAt(offset + y));
        }

        let len = vector.length - 1;

        for (; x < lb - 3; ) {
            bx0 = b.charCodeAt(offset + (d0 = x));
            bx1 = b.charCodeAt(offset + (d1 = x + 1));
            bx2 = b.charCodeAt(offset + (d2 = x + 2));
            bx3 = b.charCodeAt(offset + (d3 = x + 3));
            dd = x += 4;
            for (y = 0; y < len; y += 2) {
                dy = vector[y];
                ay = vector[y + 1];
                d0 = _min(dy, d0, d1, bx0, ay);
                d1 = _min(d0, d1, d2, bx1, ay);
                d2 = _min(d1, d2, d3, bx2, ay);
                dd = _min(d2, d3, dd, bx3, ay);
                vector[y] = dd;
                d3 = d2;
                d2 = d1;
                d1 = d0;
                d0 = dy;
            }
        }

        for (; x < lb; ) {
            bx0 = b.charCodeAt(offset + (d0 = x));
            dd = ++x;
            for (y = 0; y < len; y += 2) {
                dy = vector[y];
                vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
                d0 = dy;
            }
        }

        return dd;
    };
})();

export default function IconPickerMini({ onSelect, maxHeight }: Props) {
    maxHeight ||= "250px";

    const [search, setSearch] = useState("");
    const [icons, setIcons] = useState([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [iconsKey, setIconsKey] = useState(0);

    const toutRef = useRef<any>();

    useEffect(() => {
        const s = debouncedSearch.trim();
        if (s === "") {
            setIcons(ALL_ICONS.slice(0, 40) as any);
            return;
        }
        const icons: any = [];
        const weighted = ALL_ICONS.map((icon) => ({
            icon,
            weigth: stringDistance(debouncedSearch, icon.name),
        }));

        weighted.sort((a, b) => a.weigth - b.weigth);

        const len = Math.min(20, weighted.length);

        for (let i = 0; i < len; i++) {
            icons.push(weighted[i].icon);
        }

        setIcons(icons);
        setIconsKey((i) => i + 1);
    }, [debouncedSearch]);

    useEffect(() => {
        if (toutRef.current) {
            clearTimeout(toutRef.current);
        }
        toutRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            toutRef.current = false;
        }, 500);
        return () => {
            if (toutRef.current) {
                clearTimeout(toutRef.current);
            }
        };
    }, [search]);

    const isNoResults = isEmpty(icons);

    return (
        <div className="tableberg_icons_library_mini">
            <SearchControl
                value={search}
                onChange={(newValue) => {
                    setSearch(newValue);
                }}
                placeholder={__("Search Icon", "tableberg")}
            />
            <div
                className="tableberg_icons_library_mini_icons"
                key={iconsKey}
                style={{ maxHeight }}
            >
                {icons.map((icon: any) => (
                    <Button
                        key={icon.name}
                        title={icon.name}
                        className={`tableberg_min_icon_library_item`}
                        onClick={() =>
                            onSelect({
                                iconName: icon.name,
                                type: icon.type,
                                icon: icon.icon,
                            })
                        }
                    >
                        {icon.icon}
                    </Button>
                ))}
                {isNoResults && <p>{__("No icons found.", "tableberg")}</p>}
            </div>
        </div>
    );
}
