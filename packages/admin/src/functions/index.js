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

export const testAIConnection = async (apiKey) => {
    const data = tablebergAdminMenuData?.ai_settings;
    
    if (!data?.ajax?.testConnection) {
        throw new Error("AI settings not available");
    }

    const { url, action, nonce } = data.ajax.testConnection;
    const formData = new FormData();

    formData.append("api_key", apiKey);
    formData.append("action", action);
    formData.append("_wpnonce", nonce);

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    const result = await response.json();
    return result;
};

export const saveAISettings = async (settings) => {
    const data = tablebergAdminMenuData?.ai_settings;
    
    if (!data?.ajax?.saveSettings) {
        throw new Error("AI settings not available");
    }

    const { url, action, nonce } = data.ajax.saveSettings;
    const formData = new FormData();

    formData.append("settings", JSON.stringify(settings));
    formData.append("action", action);
    formData.append("_wpnonce", nonce);

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    const result = await response.json();
    return result;
};
