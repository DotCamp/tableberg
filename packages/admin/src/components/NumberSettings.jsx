import { debounce } from "lodash";
import { useState, useEffect } from "react";
import BoxContent from "./BoxContent/BoxContent";
const debouncedOnValueChange = debounce((val, setVal) => {
    setVal(val);
}, 500);
function NumberSettings({ title, content, name, value, onValueChange }) {
    const [numValue, setNumValue] = useState(value);
    const [debouncedValue, setDebouncedValue] = useState(numValue);

    useEffect(() => {
        onValueChange(debouncedValue, name);
    }, [debouncedValue]);
    useEffect(() => {
        debouncedOnValueChange(numValue, setDebouncedValue);
    }, [numValue]);

    return (
        <div className="tableberg-number-settings tableberg-settings-card">
            <BoxContent title={title} content={content}>
                {name !== "font_size" && (
                    <button
                        onClick={() => {
                            if (numValue > 1) {
                                setNumValue(numValue - 1);
                            }
                        }}
                        className="tableberg-number-settings-value-button tableberg-number-settings-decrease-value-button"
                    >
                        -
                    </button>
                )}
                <input
                    value={numValue}
                    type="number"
                    min={1}
                    className="tableberg-number-settings-value"
                    onChange={(e) => {
                        setNumValue(Number(e.target.value));
                    }}
                />
                {name !== "font_size" && (
                    <button
                        onClick={() => {
                            setNumValue(numValue + 1);
                        }}
                        className="tableberg-number-settings-value-button tableberg-number-settings-increase-value-button"
                    >
                        +
                    </button>
                )}
                {name === "font_size" && (
                    <div className="tableberg-number-unit">{"PX"}</div>
                )}
            </BoxContent>
        </div>
    );
}
export default NumberSettings;
