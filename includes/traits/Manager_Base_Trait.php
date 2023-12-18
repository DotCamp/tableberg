<?php
/**
 * Manager trait.
 *
 * @package Tableberg
 */

namespace Tableberg\includes\traits;

require_once TABLEBERG_DIR_PATH . 'includes/traits/Singleton_Trait.php';

/**
 * Manager base trait.
 */
trait Manager_Base_Trait {
	use Singleton_Trait;

	/**
	 * Initialization status for manager base.
	 *
	 * @var bool
	 */
	protected static $initialized = false;

	/**
	 * Is manager initialized.
	 *
	 * @return bool initialization status
	 */
	public static function is_initialized() {
		return static::$initialized;
	}

	/**
	 * Set current manager base as initialized.
	 *
	 * @return void
	 */
	protected static function set_as_initialized() {
		static::$initialized = true;
	}

	/**
	 * Main process that will be called during initialization of manager.
	 *
	 * @return void
	 */
	abstract protected function init_process();

	/**
	 * Initialize manager.
	 *
	 * Since this base is using singleton trait and abstract class together, you should provide class name of extended manager in init function.
	 *
	 * @param array       $const_args constructor arguments for singleton instance of manager.
	 * @param string|null $class_name class name to create instance.
	 *
	 * @return void
	 */
	final public static function init( $const_args = array(), $class_name = null ) {
		if ( ! static::is_initialized() ) {
			static::create_instance( $const_args, $class_name );
			static::$instance->init_process();
			static::set_as_initialized();
		}
	}
}
