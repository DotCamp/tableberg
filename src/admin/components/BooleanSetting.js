import BoxContent from "./BoxContent/BoxContent";
import ToggleControl from "./ToggleControl";

function BooleanSetting({ title, content, name, active, onStatusChange }) {
    return (
        <div className="tableberg-boolean-settings tableberg-settings-card">
            <BoxContent title={title} content={content}>
                <ToggleControl
                    status={active}
                    name={name}
                    onStatusChange={onStatusChange}
                />
            </BoxContent>
        </div>
    );
}
export default BooleanSetting;
