/// <reference path="../../../typings/globals.d.ts" />
/// <reference path="../../../typings/png.d.ts" />
/// <reference path="../../../typings/wordpress__block-editor.d.ts" />
/// <reference path="../../../typings/wordpress__data.d.ts" />
/**
 * Blocks
 */
import "./blocks/star-rating";
import "./blocks/styled-list";
import "./blocks/styled-list/styled-list-item";
import "./blocks/html";

// @ts-ignore
wp.hooks.addFilter(
    'blocks.registerBlockType',
    'tableberg/cell',
    (settings: any, name: any) => {
        if (name !== "tableberg/cell" || settings.attributes.background) {
            return settings;
        }
        settings.attributes.isPro = {
            type: "boolean",
            default: true
        };
        return settings;
    }
);
