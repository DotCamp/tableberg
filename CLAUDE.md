# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TableBerg is a WordPress plugin that provides advanced table blocks for the Gutenberg block editor. It's structured as a monorepo with both free and pro versions, using pnpm workspaces for package management.

## Essential Commands

### Development

```bash
# Install dependencies (requires pnpm)
pnpm install

# Start development mode (watches all packages)
pnpm start

# Build for production
pnpm build

# Create plugin ZIP files for distribution
pnpm export

# Export block patterns from WordPress site
pnpm patterns:get
```

### Code Quality

**IMPORTANT**: Do NOT run linting or formatting scripts. These may modify files unnecessarily and cause conflicts. The build process handles this automatically.

```bash
# These commands should NOT be run manually:
# npx wp-scripts lint-js
# npx wp-scripts lint-style 
# npx wp-scripts format
# npx wp-scripts lint-pkg-json
```

### Testing

```bash
# Test plugin activation (requires Docker)
./scripts/plugin-activation-test.sh
```

## Architecture

### Monorepo Structure

-   **packages/tableberg/** - Free version WordPress plugin
    -   `src/` - React/TypeScript source for blocks
    -   `includes/` - PHP classes and functionality
    -   `build/` - Compiled assets (gitignored)
-   **packages/pro/** - Pro version with additional features
    -   `src/` - Pro blocks source
    -   `includes/` - Pro PHP functionality
    -   `dist/` - Compiled assets (gitignored)
-   **packages/admin/** - Admin dashboard (Vite-based)
    -   Built directly to tableberg plugin directory
-   **packages/components/** - Shared React components
-   **packages/shared/** - Shared utilities and types

### Key Technologies

-   **Frontend**: React 18, TypeScript, WordPress Gutenberg APIs
-   **Backend**: PHP 7.0+, WordPress 6.1+
-   **Build Tools**:
    -   WordPress Scripts (webpack) for blocks
    -   Vite for admin interface
    -   pnpm for package management

### Block Types

**Free Version:**

-   Table Block (main feature)
-   Cell Block
-   Button Block
-   Image Block

**Pro Version:**

-   HTML Block
-   Icon Block
-   Ribbon Block
-   Star Rating Block
-   Styled List Block
-   Toggle Block
-   WooCommerce integration blocks

## Important Conventions

### Version Updates

When updating plugin version, modify in:

1. PHP plugin headers (tableberg.php, pro.php)
2. Plugin constants (e.g., `TABLEBERG_VERSION`)
3. `readme.txt` files
4. `package.json` files
5. Block `block.json` files (if blocks are updated)

### Git Workflow

-   **Main branch**: Published version
-   **Develop branch**: Next release (all changes go here first)
-   **Feature branches**: For larger changes, create PR to develop
-   **IMPORTANT**: When committing changes, DO NOT push to remote unless explicitly requested. Commit locally only.

### Code Style

-   TypeScript with strict mode enabled
-   Prettier formatting (4 spaces, double quotes, 80 char lines)
-   WordPress PHP coding standards
-   Text domain for i18n: 'tableberg' (both free and pro)

### Build Process

1. Free plugin builds to `packages/tableberg/build/`
2. Pro plugin builds to `packages/pro/dist/`
3. Admin interface builds to `packages/tableberg/includes/Admin/assets/`
4. All packages build in parallel with `pnpm build`

### Development Setup

1. Link plugin to WordPress installation:

    ```bash
    # Mac/Linux
    ln -s /path/to/tableberg/packages/tableberg /path/to/wp-content/plugins/tableberg

    # Windows
    junction.exe packages\tableberg D:\wp-content\plugins\tableberg
    ```

2. Activate plugin in WordPress admin
3. Run `pnpm start` for development mode

## Integration Points

### Freemius SDK

-   Used for licensing and monetization
-   Located in `packages/tableberg/vendor/freemius/`
-   Handles pro version activation

### WordPress APIs

-   Block Editor APIs for Gutenberg integration
-   REST API for admin interface communication
-   WordPress hooks and filters for extensibility

### Docker Environment

-   Custom Go CLI tool in `/docker/` for managing test environments
-   Supports PHP 7.4 and 8.1 with WordPress 6.5.3
-   Used for plugin activation testing

## Production Code Guidelines

**CRITICAL**: TableBerg is a production plugin used by 1000+ users. All code changes must maintain the highest standards of quality, security, and stability. Never work on more than one task at a time.

### Security Requirements

#### PHP Security

-   **Always sanitize input**: Use WordPress sanitization functions
    ```php
    $value = sanitize_text_field($_POST['field']);
    $html = wp_kses_post($_POST['html']);
    ```
-   **Always escape output**: Use appropriate escaping functions
    ```php
    echo esc_html($text);
    echo esc_attr($attribute);
    echo esc_url($url);
    ```
-   **Verify nonces**: All AJAX/form submissions must verify nonces
    ```php
    check_ajax_referer('tableberg-action', 'security');
    ```
-   **Check capabilities**: Verify user permissions
    ```php
    if (!current_user_can('edit_posts')) {
        wp_die(__('Unauthorized', 'tableberg'));
    }
    ```
-   **Validate REST API**: Add permission callbacks to all endpoints
    ```php
    'permission_callback' => function() {
        return current_user_can('edit_posts');
    }
    ```

#### JavaScript Security

-   **Sanitize dynamic HTML**: Use `@wordpress/dom-purify` or React's built-in protections
-   **Validate user input**: Check types and ranges before processing
-   **Use WordPress APIs**: Leverage `wp.apiRequest` for authenticated requests

### Code Consistency Patterns

#### React/TypeScript Components

-   **Component Structure**: Follow existing patterns in `src/blocks/`

    ```typescript
    // Use functional components with TypeScript
    interface ComponentProps {
        attribute: string;
        onUpdate: (value: string) => void;
    }

    const Component: React.FC<ComponentProps> = ({ attribute, onUpdate }) => {
        // Component logic
    };
    ```

-   **State Management**: Use WordPress Data API (`@wordpress/data`)
-   **Error Boundaries**: Wrap complex components in error boundaries
-   **Prop Validation**: Use TypeScript interfaces for all props

#### PHP Code Structure

-   **Namespace Usage**: Follow `Tableberg\Includes\` pattern
-   **Class Organization**: Use traits for shared functionality
-   **Hook Registration**: Register in constructor or dedicated init method
    ```php
    public function __construct() {
        add_action('init', [$this, 'register']);
        add_filter('the_content', [$this, 'filter_content']);
    }
    ```

### Feature Development Guidelines

#### Adding New Features

1. **Plan Architecture**: Consider free vs pro placement
2. **Maintain Backward Compatibility**: Never break existing functionality
3. **Progressive Enhancement**: Features should degrade gracefully
4. **Follow Existing Patterns**: Study similar features before implementing

#### Free vs Pro Separation

-   **Free Features**: Core functionality in `packages/tableberg/`
-   **Pro Features**: Extensions in `packages/pro/`
-   **Shared Code**: Utilities in `packages/shared/`
-   **Never**: Mix pro code in free version files

### Quality Assurance

#### Before Committing

1. **DO NOT run linting commands manually** - These are handled automatically by the build process
2. **Test in multiple browsers**: Chrome, Firefox, Safari minimum
3. **Test WordPress versions**: Current and previous major version
4. **Test with common plugins**: WooCommerce, Yoast, etc.
5. **Check console**: No errors or warnings in browser console

#### Error Handling

-   **User-Friendly Messages**: Always provide helpful error messages
-   **Fallback UI**: Provide fallbacks for failed operations
-   **Log Appropriately**: Use `console.error` for actual errors only
-   **Recovery Options**: Allow users to recover from errors

### Performance Considerations

-   **Lazy Load**: Heavy components should load on demand
-   **Minimize Rerenders**: Use React.memo and useMemo appropriately
-   **Bundle Size**: Check impact on bundle size for new dependencies
-   **Database Queries**: Optimize and cache where possible

### Accessibility

-   **ARIA Labels**: All interactive elements need proper labels
-   **Keyboard Navigation**: Everything must be keyboard accessible
-   **Screen Reader Support**: Test with screen readers
-   **Color Contrast**: Meet WCAG AA standards minimum

### Documentation

-   **Inline Documentation**: Document complex logic
-   **Update README**: If adding user-facing features
-   **API Changes**: Document any new hooks/filters
-   **Migration Guides**: For breaking changes (avoid these!)

### Testing New Features

1. **Fresh Installation**: Test on clean WordPress install
2. **Upgrade Testing**: Test upgrading from previous version
3. **Conflict Testing**: Test with popular plugins/themes
4. **Edge Cases**: Test with minimal/maximal data
5. **User Flows**: Test complete user workflows

### Common Pitfalls to Avoid

-   **Direct DOM Manipulation**: Use React, not jQuery
-   **Global Variables**: Use proper namespacing
-   **Hardcoded Values**: Use configuration/constants
-   **Missing Text Domain**: All strings need 'tableberg' domain
-   **Skipping Validation**: Always validate and sanitize
-   **Breaking Changes**: Maintain backward compatibility
-   **Running linting/formatting scripts**: NEVER run `npx wp-scripts lint-js`, `npx wp-scripts format`, or similar commands

## CRITICAL: DO NOT RUN LINTING OR FORMATTING SCRIPTS

**NEVER** run any of these commands as they may modify files unnecessarily:
- `npx wp-scripts lint-js`
- `npx wp-scripts lint-style`
- `npx wp-scripts format`
- `npx wp-scripts lint-pkg-json`

The build process handles code formatting automatically. Manual linting can cause file conflicts and unnecessary changes.
