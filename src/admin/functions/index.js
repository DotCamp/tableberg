export const toggleIndividualControl = (status) => {
    const individualData = tablebergAdminMenuData?.individual_control;

    const { url, action, nonce } = individualData.ajax.toggleIndividualControl;
    const formData = new FormData();

    formData.append("enable", JSON.stringify(status));
    formData.append("action", action);
    formData.append("_wpnonce", nonce);

    fetch(url, {
        method: "POST",
        body: formData,
    });
};

export const toggleGlobalControl = (status) => {
    const individualData = tablebergAdminMenuData?.global_control;
    const { url, action, nonce } = individualData.ajax.toggleGlobalControl;
    const formData = new FormData();

    formData.append("enable", JSON.stringify(status));
    formData.append("action", action);
    formData.append("_wpnonce", nonce);

    fetch(url, {
        method: "POST",
        body: formData,
    });
};
