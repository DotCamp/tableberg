import { __ } from "@wordpress/i18n";

export const DEFAULT_ASPECT_RATIO_OPTIONS = [
  {
    label: __("Original", "tableberg"),
    value: "",
  },
  {
    label: __("Square - 1:1", "tableberg"),
    value: "1",
  },
  {
    label: __("Standard - 4:3", "tableberg"),
    value: "4/3",
  },
  {
    label: __("Portrait - 3:4", "tableberg"),
    value: "3/4",
  },
  {
    label: __("Classic - 3:2", "tableberg"),
    value: "3/2",
  },
  {
    label: __("Classic Portrait - 2:3", "tableberg"),
    value: "2/3",
  },
  {
    label: __("Wide - 16:9", "tableberg"),
    value: "16/9",
  },
  {
    label: __("Tall - 9:16", "tableberg"),
    value: "9/16",
  },
];

export const DEFAULT_SCALE_OPTIONS = [
  {
    value: "cover",
    label: __("Cover", "tableberg"),
    help: __("Fill the space by clipping what doesn't fit."),
  },
  {
    value: "contain",
    label: __("Contain", "tableberg"),
    help: __("Fit the content to the space without clipping."),
  },
];

export const DEFAULT_SIZE_SLUG_OPTIONS = [
  {
    label: __("Thumbnail", "tableberg"),
    value: "thumbnail",
  },
  {
    label: __("Medium", "tableberg"),
    value: "medium",
  },
  {
    label: __("Large", "tableberg"),
    value: "large",
  },
  {
    label: __("Full Size", "tableberg"),
    value: "full",
  },
];
