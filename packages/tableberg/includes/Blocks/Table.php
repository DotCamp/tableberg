<?php
/**
 * Table Block
 *
 * @package Tableberg
 */

namespace Tableberg\Blocks;

use Tableberg;
use Tableberg\Utils\Utils;
use Tableberg\Utils\HtmlUtils;
use WP_Block;

/**
 * Handle the block registration on server side and rendering.
 */
class Table
{

	public static $rows = [];

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct()
	{
		add_action('init', array($this, 'block_registration'));
	}

	/**
	 * Get block styles.
	 *
	 * @param array $attributes - block attributes.
	 * @return string Generated CSS styles.
	 */
	public static function get_styles($attributes)
	{
		$even_row_bg = Utils::get_background_color($attributes, 'evenRowBackgroundColor', 'evenRowBackgroundGradient');
		$odd_row_bg = Utils::get_background_color($attributes, 'oddRowBackgroundColor', 'oddRowBackgroundGradient');
		$header_bg = Utils::get_background_color($attributes, 'headerBackgroundColor', 'headerBackgroundGradient');
		$footer_bg = Utils::get_background_color($attributes, 'footerBackgroundColor', 'footerBackgroundGradient');


		$cellSpacing = $attributes['cellSpacing'] ?? [];
		$table_spacing = Utils::get_spacing_css($cellSpacing);


		$inner_border_variables = [];
		if ($attributes['enableInnerBorder']) {
			$inner_border_variables = Utils::get_border_variables_css($attributes['innerBorder'], 'inner');
		}
		if (!isset($table_spacing['top']) || $table_spacing['top'] == '0') {
			$inner_border_variables["--tableberg-inner-border-top"] = "none";
			$inner_border_variables["--tableberg-inner-border-top-first"] = $inner_border_variables["--tableberg-inner-border-bottom"] ?? '';
		}

		if (!isset($table_spacing['left']) || $table_spacing['left'] == '0') {
			$inner_border_variables["--tableberg-inner-border-left"] = "none";
			$inner_border_variables["--tableberg-inner-border-left-first"] = $inner_border_variables["--tableberg-inner-border-right"] ?? '';
		}


		$cell_radius = Utils::get_border_radius_var($attributes['cellBorderRadius'], '--tableberg-cell');

		$styles = [
			'width' => $attributes['tableWidth'],
			'max-width' => $attributes['tableWidth'],
			'color' => $attributes['fontColor'] ?? '',
			'font-size' => $attributes['fontSize'] ?? '',
			'--tableberg-global-link-color' => $attributes['linkColor'] ?? '',
			'--tableberg-even-bg' => $even_row_bg,
			'--tableberg-odd-bg' => $odd_row_bg,
			'--tableberg-header-bg' => $header_bg,
			'--tableberg-footer-bg' => $footer_bg,
			'--tableberg-block-spacing' => Utils::get_spacing_css_single($attributes['blockSpacing'] ?? ''),
			'border-spacing' => ($table_spacing['left'] ?? 0) . ' ' . ($table_spacing['top'] ?? 0),
		]
			+ Utils::get_spacing_style($attributes['cellPadding'], '--tableberg-cell-padding')
			+ $inner_border_variables
			+ $cell_radius;

		return Utils::generate_css_string($styles);
	}


	private static function get_wrapper_styles($attributes)
	{
		$styles = Utils::get_border_style($attributes['tableBorder'] ?? []);
		$styles += Utils::get_border_radius_style($attributes['tableBorderRadius'] ?? []);
		return Utils::generate_css_string($styles);
	}

	/**
	 * Class if styling is applied.
	 *
	 * @param array $attributes The block attributes.
	 * @return array CSS classes based on attributes.
	 */
	public function get_style_class($attributes)
	{
		$table_width = $attributes['tableWidth'];

		$enable_inner_border = $attributes['enableInnerBorder'];
		$classes = array();
		if ($enable_inner_border) {
			$classes[] = 'has-inner-border';
		}
		$is_value_empty = function ($value) {
			return (
				is_null($value) ||
				false === $value ||
				trim($value) === '' ||
				trim($value) === 'undefined undefined undefined' ||
				empty($value)
			);
		};

		if (!$is_value_empty($table_width)) {
			$classes[] = 'has-table-width';
		}


		return $classes;
	}



	private static function get_responsiveness_metadata($attributes, $device)
	{
		if (!isset($attributes["responsive"])) {
			return '';
		}
		$responsive = $attributes["responsive"]["breakpoints"];
		$str = " ";
		if (isset($responsive[$device]) && $responsive[$device]["enabled"]) {
			$deviceOpts = $responsive[$device];
			$str .= 'data-tableberg-' . $device . '-width="' . $deviceOpts["maxWidth"] . '" ';
			$str .= 'data-tableberg-' . $device . '-mode="' . $deviceOpts["mode"] . '" ';
			$str .= 'data-tableberg-' . $device . '-direction="' . $deviceOpts["direction"] . '" ';
			$str .= 'data-tableberg-' . $device . '-count="' . $deviceOpts["stackCount"] . '" ';

			if ($deviceOpts["headerAsCol"] && $attributes['enableTableHeader']) {
				$str .= 'data-tableberg-' . $device . '-header="' . $deviceOpts["headerAsCol"] . '" ';
			}
		}
		return $str;
	}

	/**
	 * Renders the custom table block on the server.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block content.
	 * @param WP_Block $block      The block object.
	 * @return string Returns the HTML content for the custom table block.
	 */
	public function render_tableberg_table_block($attributes, $content, $block)
	{
		$table_class_names = $this->get_style_class($attributes);
		$table_style = $this->get_styles($attributes);

		$table_attrs = 'class = "' . esc_attr(trim(join(' ', $table_class_names))) . '" style="' . $table_style . '" ';
		
		$table_attrs .= 'data-tableberg-header="' . $attributes['enableTableHeader'] . '" ';
		$table_attrs .= 'data-tableberg-footer="' . $attributes['enableTableFooter'] . '" ';

		$responsive = trim(self::get_responsiveness_metadata($attributes, 'mobile') . self::get_responsiveness_metadata($attributes, 'tablet'));
		if ($responsive) {
			$table_attrs .= 'data-tableberg-responsive data-tableberg-rows="' . $attributes['rows'] . '" data-tableberg-cols="' . $attributes['cols'] . '" ' . $responsive;
		}

		$wrapper_classes = ['wp-block-tableberg-wrapper'];
		$table_alignment = $attributes['tableAlignment'];
		if ($table_alignment && $table_alignment !== "center") {
			$wrapper_classes[] = 'justify-table-' . $table_alignment;
		}

		if ($attributes['stickyTopRow']) {
			$wrapper_classes[] = 'tableberg-sticky-top-row';
		}
		if ($attributes['stickyFirstCol']) {
			$wrapper_classes[] = 'tableberg-sticky-first-col';
		}
		if ($attributes['innerBorderType'] === 'col') {
			$wrapper_classes[] = 'tableberg-border-col-only';
		} elseif ($attributes['innerBorderType'] === 'row') {
			$wrapper_classes[] = 'tableberg-border-row-only';
		}

		if ($attributes['hideCellOutsideBorders'] ?? true) {
			$wrapper_classes[] = 'tableberg-cell-no-outside-border';
		}

		if ($attributes['disableThemeStyle']) {
			$wrapper_classes[] = 'tableberg-theme-disabled';
		}

		$wrapper_attributes = get_block_wrapper_attributes([
			'class' => trim(join(' ', $wrapper_classes)),
		]);

		$colBorders = [];
		$colGroup = '<colgroup>';

		if ($attributes['fixedColWidth']) {
			$fwidth = 100 / (int) $attributes['cols'] . '%';
		}

		for ($i = 0; $i < $attributes['cols']; $i++) {
			$colStyle = $attributes['colStyles'][$i] ?? [];
			$width = $fwidth ?? Utils::get_spacing_css_single($colStyle['width'] ?? '');

			$colCss = Utils::generate_css_string([
				'width' => $width,
				'min-width' => $width,
				'background' => Utils::get_background_color($colStyle, 'background', 'bgGradient'),
			]);

			$colGroup .= '<col style="' . $colCss . '"/>';
			$colBorders[$i] = Utils::generate_css_string(
				Utils::get_border_variables_css($colStyle['border'] ?? [], 'col')
				+ Utils::get_border_radius_var($colStyle['borderRadius'] ?? [], '--tableberg-col')
			);
		}

		$colGroup .= '</colgroup>';

		$content = '<tbody>';

		$isHSort = isset($attributes['sort']['horizontal']['enabled']) && $attributes['sort']['horizontal']['enabled'];
		$isVSort = isset($attributes['sort']['vertical']['enabled']) && $attributes['sort']['vertical']['enabled'];

		for ($i = 0; $i < $attributes['rows']; $i++) {
			$rowStyle = $attributes['rowStyles'][$i] ?? [];
			$rowCss = Utils::generate_css_string([
				'height' => Utils::get_spacing_css_single($rowStyle['height'] ?? ''),
			] + Utils::get_border_radius_var($rowStyle['borderRadius'] ?? [], '--tableberg-row'));
			$tagName = 'td';
			$trClasses = '';
			$isEven = $i % 2 === 1;
			$isHeader = $i === 0 && $attributes['enableTableHeader'];
			$isFooter = $attributes['enableTableFooter'] && $i === $attributes['rows'] - 1;

			if ($attributes['enableTableHeader']) {
				$isEven = !$isEven;
			}

			if ($isHeader) {
				$tagName = 'th';
				$trClasses = 'tableberg-header';
			} elseif ($isFooter) {
				$tagName = 'th';
				$trClasses = 'tableberg-footer';
			} elseif ($isEven) {
				$trClasses = 'tableberg-even-row';
			} else {
				$trClasses = 'tableberg-odd-row';
			}

			$rowStyleCss = Utils::generate_css_string(Utils::get_border_variables_css($rowStyle['border'] ?? [], 'row'));

			$rowBg = Utils::get_background_color($rowStyle, 'background', 'bgGradient');
			if ($rowBg) {
				$rowStyleCss .= 'background:' . esc_attr($rowBg) . ';';
			} else {
				$rowStyleCss .= '';
			}




			$sortingBtnV = '';

			if ($isVSort && $i == 0) {
				$sortingBtnV = '<button type="button" class="tableberg-v-sorter"></button>';
			}

			$content .= '<tr class="' . $trClasses . '" style="' . $rowStyleCss . '">';
			for ($j = 0; $j < $attributes['cols']; $j++) {
				$sortingBtns = $sortingBtnV;
				if ($isHSort && $j == 0) {
					$sortingBtns .= '<button type="button" class="tableberg-h-sorter"></button>';
				}
				$cell = self::$rows[$i][$j] ?? ' ';
				$cell = HtmlUtils::append_attr_value($cell, $tagName, $rowCss . $colBorders[$j], 'style');
				$cell = HtmlUtils::replace_closing_tag($cell, $tagName, $sortingBtns . '</' . $tagName . '>');
				$content .= $cell;
			}
			$content .= '</tr>';
		}

		$content .= '</tbody>';

		self::$rows = [];

		$table = '';

		if ($attributes['search']) {
			$table = '
				<div class="tableberg-search tableberg-search-' . $attributes['searchPosition'] . '">
					<input type="text" placeholder="' . esc_attr( isset($attributes['searchPlaceholder']) && $attributes['searchPlaceholder'] !== 'Search...' ? $attributes['searchPlaceholder']: __('Search...', 'tableberg')). '" data-tableberg-search />
					<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="magnifying-glass" class="svg-inline--fa fa-magnifying-glass " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
						<path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path>
					</svg>
				</div>
			';
		}

		$table .= '
			<div class="tableberg-table-wrapper" style="' . self::get_wrapper_styles($attributes) . '">
				<table ' . $table_attrs . ' >' . $colGroup . $content . '</table>
			</div>
		';



		return '<div ' . $wrapper_attributes . ' >' . $table . '</div>';
	}


	/**
	 * Register the block.
	 */
	public function block_registration()
	{
		$tableberg_assets = new \Tableberg\Assets();
		$tableberg_assets->register_blocks_assets();
		if (!is_admin()) {
			$tableberg_assets->register_frontend_assets();
		}
		$jsonPath = TABLEBERG_DIR_PATH . 'build/block.json';
		$attrs = json_decode(file_get_contents($jsonPath), true)['attributes'];

		register_block_type_from_metadata(
			$jsonPath,
			[
				'attributes' => $attrs,
				'render_callback' => array($this, 'render_tableberg_table_block'),
			]
		);

	}
}
