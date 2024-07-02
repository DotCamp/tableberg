<?php

namespace Tableberg\Utils;

class HtmlUtils
{

    /**
     * Insert code in the beginning of the offset'th specified tag
     * 
     * @param string $content
     * @param string $tag
     * @param string $code
     * @param int $offset
     * @return string new content with added attributes
     */
    public static function insert_inside_tag($content, $tag, $code, $offset = 0)
    {
        $tag = '<' . $tag;
        $idx = strpos($content, $tag, $offset);
        if ($idx === false) {
            return $content;
        }
        $lidx = strpos($content, '>', $idx + 1);
        if ($lidx === false) {
            return $content;
        }
        return substr_replace($content, $code, $lidx + 1, 0);
    }
    /**
     * Add attributes to the offset'th specified tag
     * 
     * @param string $content
     * @param string $tag
     * @param string $attr_str
     * @param int $offset
     * @return string new content with added attributes
     */
    public static function add_attrs_to_tag($content, $tag, $attr_str, $offset = 0)
    {
        $tag = '<' . $tag;
        $idx = strpos($content, $tag, $offset);
        if ($idx === false) {
            return $content;
        }
        return substr_replace($content, $tag . " " . $attr_str." ", $idx, strlen($tag) + 1);
    }

    /**
     * Replace attributes of the offset'th specified tag
     * 
     * @param string $content
     * @param string $tag
     * @param string $attr_str
     * @param int $offset
     * @return string new content with added attributes
     */
    public static function replace_attrs_of_tag($content, $tag, $attr_str, $offset = 0)
    {
        $tag = '<' . $tag;
        $fidx = strpos($content, $tag, $offset);
        if ($fidx === false) {
            return $content;
        }
        $lidx = strpos($content, '>', $fidx);
        if ($lidx === false) {
            return $content;
        }
        return substr_replace($content, $tag . " " . $attr_str . ">", $fidx, $lidx - $fidx + 1);
    }

    /**
     * Replace closing of the offset'th specified tag
     * 
     * @param string $content
     * @param string $tag
     * @param string $replacement
     * @param int $offset
     * @return string new content with added attributes
     */
    public static function replace_closing_tag($content, $tag, $replacement, $offset = -1)
    {
        $tag = '</' . $tag . '>';
        $idx = strrpos($content, $tag, $offset);
        if ($idx === false) {
            return $content;
        }

        return substr_replace($content, $replacement, $idx, strlen($tag));
    }

    /**
     * Replace closing of the offset'th specified tag
     * 
     * @param string $content
     * @param string $tag
     * @param string $replacement
     * @param int $offset
     * @return string new content with added attributes
     */
    public static function replace_starting_tag($content, $tag, $replacement, $offset = 0)
    {
        $tag = '<' . $tag;
        $idx = strpos($content, $tag, $offset);
        if ($idx === false) {
            return $content;
        }

        return substr_replace($content, $replacement, $idx, strlen($tag));
    }

    /**
     * Append attribute value to the offset'th specified tag
     * <div class"abc"></div> -> <div class"abc newclass"></div>
     * 
     * @param string $content
     * @param string $tag
     * @param string $value
     * @param string $attr
     * @param int $offset
     * @return string new content with added attribute
     */
    public static function append_attr_value($content, $tag, $value, $attr, $offset = 0, &$cursor = false)
    {
        $idx = strpos($content, '<' . $tag, $offset);
        if ($idx === false) {
            return $content;
        }
        $lidx = strpos($content, '>', $idx + 1);
        if ($lidx === false) {
            return $content;
        }
        $cursor = $lidx;
        $tagDes = substr($content, $idx, $lidx - $idx);
        $count = 0;
        $tagDes = preg_replace("/$attr=\"(.*?)\"/", "$attr=\"$1" . $value . "\"", $tagDes, -1, $count);
        if ($count == 0) {
            $tagDes = substr_replace($tagDes, " $attr=\"$value\"", strlen($tag) + 1, 0);
        }
        return substr_replace($content, $tagDes, $idx, $lidx - $idx);
    }

}