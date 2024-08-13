<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @package tableberg
 */

namespace Tableberg\Admin;

use Tableberg;
use Tableberg\Version_Control;

/**
 * Manage Tableberg Admin
 */
class Tableberg_Admin
{
    /**
     * The ID of this plugin.
     *
     * @access   private
     * @var      string $plugin_name The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @access   private
     * @var      string $version The current version of this plugin.
     */
    private $version;

    /**
     * The PATH of this plugin.
     *
     * @access   private
     * @var      string $plugin_path The PATH of this plugin.
     */
    private $plugin_path;

    /**
     * The URL of this plugin.
     *
     * @access   private
     * @var      string $plugin_url The URL of this plugin.
     */
    private $plugin_url;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct()
    {

        $this->plugin_name = 'tableberg';
        $this->version     = TABLEBERG_VERSION;
        $this->plugin_path = TABLEBERG_DIR_PATH;
        $this->plugin_url  = TABLEBERG_URL;
        $this->add_tableberg_admin_hook();

        // initialize version sync manager.
        Tableberg\Version_Sync_Manager::init();

        // initialize version control manager.
        Version_Control::init();

        add_action('admin_menu', array($this, 'register_admin_menus'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_script'));
        add_action('admin_notices', array($this, 'tableberg_review_notice'));
        add_action('wp_ajax_TablebergReviewNoticeHide', array($this, 'tableberg_hide_review_notify'));
        add_filter('tableberg/filter/admin_settings_menu_data', array($this, 'add_settings_menu_data'), 1, 1);
    }

    /**
     * Add hook
     */
    public function add_tableberg_admin_hook()
    {
        add_action('wp_ajax_toggle_control', array($this, 'update_toggle_control'));
        add_action('wp_ajax_block_properties', array($this, 'update_block_properties'));
    }

    /**
     * Block properties control
     */
    private function update_block_properties()
    {
        check_ajax_referer('block_properties');

        if (isset($_POST['value']) && isset($_POST['property_name'])) {
            $value            = sanitize_text_field(wp_unslash($_POST['value']));
            $property_name    = sanitize_text_field(wp_unslash($_POST['property_name']));
            $saved_properties = get_option('tableberg_block_properties', false);
            if ($saved_properties) {
                foreach ($saved_properties as $key => $property) {
                    if ($property['name'] === $property_name) {
                        $saved_properties[$key]['value'] = (int) $value;
                    }
                }
            }

            update_option('tableberg_block_properties', $saved_properties);
        }

        die();
    }

    /**
     * Toggle control
     */
    private function update_toggle_control()
    {
        check_ajax_referer('toggle_control');

        if (isset($_POST['enable']) && isset($_POST['toggle_name'])) {
            $enable      = sanitize_text_field(wp_unslash($_POST['enable']));
            $toggle_name = sanitize_text_field(wp_unslash($_POST['toggle_name']));
            update_option($toggle_name, $enable);
        }
        die();
    }

    /**
     * Add data for admin settings menu frontend.
     *
     * @param array $data frontend data.
     *
     * @return array filtered frontend data
     */
    public function add_settings_menu_data($data)
    {
        $data['assets'] = array(
            'logo' => trailingslashit($this->plugin_url) . 'includes/Admin/images/logos/menu-icon-colored.svg',
            'logoTransparent' => trailingslashit($this->plugin_url) . 'includes/Admin/images/logos/menu-icon-colored-transparent.svg',
        );

        $data['individual_control'] = array(
            'data' => get_option('tableberg_individual_control', false),
            'ajax' => array(
                'toggleControl' => array(
                    'url'    => admin_url('admin-ajax.php'),
                    'action' => 'toggle_control',
                    'nonce'  => wp_create_nonce('toggle_control'),
                ),
            ),
        );
        $data['global_control']     = array(
            'data' => get_option('tableberg_global_control', false),
            'ajax' => array(
                'toggleControl' => array(
                    'url'    => admin_url('admin-ajax.php'),
                    'action' => 'toggle_control',
                    'nonce'  => wp_create_nonce('toggle_control'),
                ),
            ),
        );
        $data['block_properties']   = array(
            'data' => get_option('tableberg_block_properties', false),
            'ajax' => array(
                'blockProperties' => array(
                    'url'    => admin_url('admin-ajax.php'),
                    'action' => 'block_properties',
                    'nonce'  => wp_create_nonce('block_properties'),
                ),
            ),
        );

        global $tp_fs;
        if (isset($tp_fs)) {
            $data['misc'] = [
                'pro_status' => $tp_fs->is__premium_only()
                    && $tp_fs->can_use_premium_code()
            ];
        } else {
            $data['misc'] = [
                'pro_status' => false
            ];
        }

        $data = array_merge($data, Tableberg\Utils\Utils::welcome_page());
        return $data;
    }

    /**
     * Enqueue admin scripts.
     */
    public function enqueue_admin_script()
    {
        $tableberg_assets = new Tableberg\Assets();
        $tableberg_assets->register_admin_assets();
    }

    /**
     * Set template for main setting page
     *
     * @return void
     */
    public function main_menu_template_cb()
    {
?>
<div id="tableberg-admin-menu"></div>
<?php
    }

    /**
     * Register Setting Pages for the admin area.
     */
    public function register_admin_menus()
    {

        // assign global variables.
        global $menu_page;
        global $menu_page_slug;

        $menu_page_slug = 'tableberg-settings';
        $menu_page      = add_menu_page(
            'Tableberg Settings',
            'Tableberg',
            'manage_options',
            $menu_page_slug,
            array($this, 'main_menu_template_cb'),
            plugin_dir_url(__FILE__) . 'images/logos/menu-icon.svg'
        );
    }

    /**
     * Generating the review notice.
     *
     * @since 2.1.6
     */
     public static function tableberg_review_notice()
     {
         $install_date = get_option('tableberg_installDate');
         $display_date = date('Y-m-d h:i:s');
         $datetime1    = new \DateTime($install_date);
         $datetime2    = new \DateTime($display_date);
         $diff_interval = round(($datetime2->format('U') - $datetime1->format('U')) / (60 * 60 * 24));
     
         if ($diff_interval >= 21 && get_option('tableberg_review_notify') == 'no') {
             ?>
             <div class="tableberg-review-notice notice notice-info" style="display: inline-block; position: relative; padding:0.5rem 1.5rem">
                 <button type="button" class="notice-dismiss Tableberg_HideReview_Notice" style="position: absolute; top: 2px; right: 2px;">
                     <span class="screen-reader-text">Dismiss this notice.</span>
                 </button>
                 <p style="font-size: 14px; line-height: 2;padding-right:2rem">
                     <?php
                     _e(
                         'Hello! Seems like you\'ve been using <strong>Tableberg</strong> for a while on your website. That\'s awesome!<br>If you can spare a few moments to rate it on wordpress.org, it would help us a lot (and boost my motivation).<br>Imtiaz Rayhan, developer of Tableberg',
                         'tableberg'
                     );
                     ?>
                 </p>
                 <ul style="list-style-type: none; padding: 0;">
                     <li>
                         <a style="margin-right: 5px; margin-bottom: 5px;" class="button-primary" href="https://wordpress.org/support/plugin/tableberg/reviews/?filter=5#new-post" target="_blank">Ok, I will gladly help!</a>
                         <a class="Tableberg_HideReview_Notice button" href="javascript:void(0);">No, thanks</a>
                     </li>
                 </ul>
             </div>
             <script>
                 jQuery(document).ready(function($) {
                     $('.Tableberg_HideReview_Notice').click(function() {
                         var data = {
                             'action': 'TablebergReviewNoticeHide'
                         };
                         $.ajax({
                             url: "<?php echo admin_url('admin-ajax.php'); ?>",
                             type: "post",
                             data: data,
                             dataType: "json",
                             async: true,
                             success: function(notice_hide) {
                                 if (notice_hide == "success") {
                                     $('.tableberg-review-notice').slideUp('fast');
                                 }
                             }
                         });
                     });
                 });
             </script>
             <?php
         }
     }
     

    /**
     * Hides the review notice.
     *
     * @since 2.1.6
     */
    public function tableberg_hide_review_notify()
    {
        update_option('tableberg_review_notify', 'yes');
        echo json_encode(array('success'));
        exit;
    }
}
