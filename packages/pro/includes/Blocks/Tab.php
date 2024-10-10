<?php

namespace Tableberg\Pro\Blocks;

/**
 *
 *@package Tableberg_pro 
 */

class Tab
{

  public function __construct()
  {
    add_action("init", [$this, "register_block"]);
  }

  public function render_tab_block()
  {
    return "";
  }

  public function register_block()
  {
    $json = TABLEBERG_PRO_DIR_PATH . 'dist/blocks/tab/block.json';
    $attrs = json_decode(file_get_contents($json), true)['attributes'];

    register_block_type_from_metadata(
      $json,
      [
        "attributes" => $attrs,
        "render_callback" => [$this, "render_tab_block"]
      ]
    );
  }
}
