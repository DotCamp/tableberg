export const updateBlockProperties = (value, propertyName) => {
    const data = tablebergAdminMenuData?.block_properties;

    const { url, action, nonce } = data.ajax.blockProperties;
    const formData = new FormData();

    formData.append("property_name", propertyName);
    formData.append("value", JSON.stringify(value));
    formData.append("action", action);
    formData.append("_wpnonce", nonce);

    fetch(url, {
        method: "POST",
        body: formData,
    });
};
export const toggleControl = (status, name) => {
    const data = tablebergAdminMenuData?.[name];

    const { url, action, nonce } = data.ajax.toggleControl;
    const formData = new FormData();

    formData.append("toggle_name", "tableberg_" + name);
    formData.append("enable", JSON.stringify(status));
    formData.append("action", action);
    formData.append("_wpnonce", nonce);

    fetch(url, {
        method: "POST",
        body: formData,
    });
};
