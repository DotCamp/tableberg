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

	public static $lastRow = null;
	public static $lastRows = 0;

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
		$odd_row_bg  = Utils::get_background_color($attributes, 'oddRowBackgroundColor', 'oddRowBackgroundGradient');
		$header_bg = Utils::get_background_color($attributes, 'headerBackgroundColor', 'headerBackgroundGradient');
		$footer_bg  = Utils::get_background_color($attributes, 'footerBackgroundColor', 'footerBackgroundGradient');

		$global_font_style = Utils::get_global_style_variables_css($attributes);

		$cell_padding  = Utils::get_spacing_css($attributes['cellPadding']);
		$cellSpacing   = $attributes['cellSpacing'] ?? [];
		$table_spacing = Utils::get_spacing_css($cellSpacing);


		$table_border_variables = Utils::get_border_variables_css($attributes['tableBorder'], 'table');
		$inner_border_variables = $attributes['enableInnerBorder'] ? Utils::get_border_variables_css($attributes['innerBorder'], 'inner') : array();

		$styles = [
			'width' => $attributes['tableWidth'],
			'max-width' => $attributes['tableWidth'],
			'--tableberg-even-bg' => $even_row_bg,
			'--tableberg-odd-bg' => $odd_row_bg,
			'--tableberg-header-bg' => $header_bg,
			'--tableberg-footer-bg' => $footer_bg,
			'--tableberg-cell-padding-top' => $cell_padding['top'] ?? '',
			'--tableberg-cell-padding-right' => $cell_padding['right'] ?? '',
			'--tableberg-cell-padding-bottom' => $cell_padding['bottom'] ?? '',
			'--tableberg-cell-padding-left' => $cell_padding['left'] ?? '',
			'--tableberg-cell-spacing-top' => $table_spacing['top'] ?? '',
			'--tableberg-cell-spacing-left' => $table_spacing['left'] ?? '',
		] + $table_border_variables + $inner_border_variables + $global_font_style;

		foreach (['top', 'left'] as $k) {
			if (isset($cellSpacing[$k]) && $cellSpacing[$k] !== '0') {
				$styles['--tableberg-border-collapse'] = 'separate';
			} else {
				$styles += $table_border_variables;
			}
		}

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
		$classes             = array();
		if ($enable_inner_border) {
			$classes[] = 'has-inner-border';
		}
		$is_value_empty = function ($value) {
			return (
				is_null($value) ||
				false === $value ||
				trim($value) === '' ||
				trim($value) === 'undefined undefined undefined' ||
				empty ($value)
			);
		};

		if (!$is_value_empty($table_width)) {
			$classes[] = 'has-table-width';
		}


		return $classes;
	}



	private static function setRowColSizes($content, $heights, $widths)
	{
		$lastIdx = 0;
		foreach ($heights as $height) {
			$idx = strpos($content, '<tr', $lastIdx);
			if ($height) {
				$content = HtmlUtils::append_attr_value($content, 'tr', "height:{$height} !important;", 'style', $idx);
			}
			$lastIdx = $idx + 1;
		}
		$colgroup = '<colgroup>';
		foreach ($widths as $w) {
			$colgroup .= "<col width=\"$w\" style=\"min-width:$w;\"/>";
		}
		$colgroup .= '</colgroup>';
		$content  = HtmlUtils::insert_inside_tag($content, 'table', $colgroup);
		return $content;
	}

	private function even_odd_rows($attributes, $content)
	{
		$even_color = Utils::get_background_color($attributes, 'evenRowBackgroundColor', 'evenRowBackgroundGradient');
		$odd_color  = Utils::get_background_color($attributes, 'oddRowBackgroundColor', 'oddRowBackgroundGradient');

		if (!$even_color && !$odd_color) {
			return $content;
		}

		

		$cursor = 0;
		$i      = 0;
		$end    = $attributes['rows'] - 1;
		if ($attributes['enableTableHeader']) {
			$i       = 1;
			$content = HtmlUtils::append_attr_value($content, 'tr', '', 'class', 0, $cursor);
		}
		if ($attributes['enableTableFooter']) {
			$end -= 1;
		}


		for (; $i <= $end; $i++) {
			$content = HtmlUtils::append_attr_value($content, 'tr', $i % 2 ? 'tableberg-odd-row' : 'tableberg-even-row', 'class', $cursor + 1, $cursor);
		}

		return $content;
	}

	private static function get_responsiveness_metadata($attributes, $device)
	{
		if (!isset($attributes["responsive"])) {
			return '';
		}
		$responsive = $attributes["responsive"]["breakpoints"];
		$str        = " ";
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
		$table_style       = $this->get_styles($attributes);

		$table_attrs = 'class = "' . trim(join(' ', $table_class_names)) . '" style="' . $table_style . '"';

		$content = HtmlUtils::insert_inside_tag($content, 'table', '<tbody>');
		$content = HtmlUtils::replace_attrs_of_tag($content, 'table', $table_attrs);
		$content = HtmlUtils::replace_closing_tag($content, 'table', '</tr></tbody></table>');

		if ($attributes['enableTableHeader']) {
			$content  = HtmlUtils::append_attr_value($content, 'tr', ' tableberg-header', 'class');
			$bg_color = Utils::get_background_color($attributes, 'headerBackgroundColor', 'headerBackgroundGradient');
			if ($bg_color) {
				$content = HtmlUtils::append_attr_value($content, 'tr', "background: {$bg_color} !important;", 'style');
			}

		}
		if ($attributes['enableTableFooter']) {
			$footer_idx = strrpos($content, '<tr');
			$content    = HtmlUtils::append_attr_value($content, 'tr', ' tableberg-footer', 'class', $footer_idx);
			$bg_color   = Utils::get_background_color($attributes, 'footerBackgroundColor', 'footerBackgroundGradient');
			if ($bg_color) {
				$content = HtmlUtils::append_attr_value($content, 'tr', "background: {$bg_color} !important;", 'style', $footer_idx);
			}
		}


		$content = self::setRowColSizes($content, $attributes['rowHeights'], $attributes['colWidths']);
		$content = self::even_odd_rows($attributes, $content);

		$responsive = trim(self::get_responsiveness_metadata($attributes, 'mobile') . self::get_responsiveness_metadata($attributes, 'tablet'));

		if ($responsive) {
			
			$str  = 'data-tableberg-header="'.$attributes['enableTableHeader'].'" ';
			$str .= 'data-tableberg-footer="'.$attributes['enableTableFooter'].'" ';
			$responsive = 'data-tableberg-responsive '.$str.' data-tableberg-rows="' . $attributes['rows'] . '" data-tableberg-cols="' . $attributes['cols'] . '" ' . $responsive;
			$content    = HtmlUtils::add_attrs_to_tag($content, 'table', $responsive);
		}

		self::$lastRow = null;

		$wrapper_classes = ['wp-block-tableberg-wrapper'];
		$table_alignment = $attributes['tableAlignment'];
		if ($table_alignment && $table_alignment !== "center") {
			$wrapper_classes[] = 'justify-table-' . $table_alignment;
		}
		$wrapper_attributes = get_block_wrapper_attributes([
			'class' => trim(join(' ', $wrapper_classes)),
		]);

		return '<div ' . $wrapper_attributes . ' >' . $content . '</div>';
	}


	/**
	 * Register the block.
	 */
	public function block_registration()
	{
		$defaults         = new \Tableberg\Defaults();
		register_block_type(
			TABLEBERG_DIR_PATH . 'src/block.json',
			array(
				'attributes' => $defaults->get_default_attributes('tableberg/table'),
				'render_callback' => array($this, 'render_tableberg_table_block'),
			)
		);
	}
}
