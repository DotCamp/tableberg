<?php

namespace Tableberg\Utils;

class HtmlUtils
{

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
        return substr_replace($content, $tag . " " . $attr_str, $idx, 0);
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
     * Add class attribute to the offset'th specified tag
     * 
     * @param string $content
     * @param string $tag
     * @param string $classes
     * @param int $offset
     * @return string new content with added classes
     */
    public static function add_class_to_tag($content, $tag, $classes, $offset = 0)
    {
        $idx = strpos($content, '<' . $tag, $offset);
        if ($idx === false) {
            return $content;
        }
        $lidx = strpos($content, '>', $idx + 1);
        if ($lidx === false) {
            return $content;
        }
        $tagDes = substr($content, $idx, $lidx - $idx);
        $count = 0;
        $tagDes = preg_replace("/class=\"(.*)\"/", "class=\"$1 " . $classes . "\"", $tagDes, -1, $count);
        if ($count == 0) {
            $tagDes = substr_replace($tagDes, " class=\"$classes\"", strlen($tag) + 1, 0);
        }
        return substr_replace($content, $tagDes, $idx, $lidx - $idx);
    }

}