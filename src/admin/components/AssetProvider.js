import { welcomePageAssets } from "../data/settings-menu-data";

/**
 * Store asset provider.
 *
 * Component child should be a function that will be called with the asset object.
 *
 * @param {Object}   props               component properties
 * @param {Function} props.children      children function, this function will be called with the asset object
 * @param {Array}    props.assetIds      array of asset ids to be fetched from data store
 * @class
 */
function AssetProvider({ children, assetIds = [] }) {
    const getAsset = (assetId) => {
        return welcomePageAssets?.[assetId];
    };
    const assetObj = assetIds.reduce((acc, assetId) => {
        acc[assetId] = getAsset(assetId);
        return acc;
    }, {});

    return children(assetObj);
}

/**
 * @module AssetProvider
 */
export default AssetProvider;
