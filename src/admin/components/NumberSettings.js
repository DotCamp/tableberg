import { useState } from "react";
import BoxContent from "./BoxContent/BoxContent";

function UnitControl({ unit }) {
    return <div className="tableberg-number-unit">{unit}</div>;
}
function NumberSettings({ title, content, name, value }) {
    const [numValue, setNumValue] = useState(value);
    return (
        <div className="tableberg-number-settings tableberg-settings-card">
            <BoxContent title={title} content={content}>
                {name !== "font-size" && (
                    <button
                        onClick={() =>
                            numValue > 1 && setNumValue(numValue - 1)
                        }
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
                    onChange={(e) => setNumValue(Number(e.target.value))}
                />
                {name !== "font-size" && (
                    <button
                        onClick={() => setNumValue(numValue + 1)}
                        className="tableberg-number-settings-value-button tableberg-number-settings-increase-value-button"
                    >
                        +
                    </button>
                )}
                {name === "font-size" && <UnitControl unit={"PX"} />}
            </BoxContent>
        </div>
    );
}
export default NumberSettings;
