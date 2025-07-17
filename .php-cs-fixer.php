<?php

return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
        'single_quote' => true,
        'braces_position' => [
            'functions_opening_brace' => 'same_line',
            'classes_opening_brace' => 'same_line',
        ],
        'visibility_required' => false,
    ])
    ->setIndent('    ') // 4 spaces
    ->setLineEnding("\n") // LF line endings
    ->setFinder(
        PhpCsFixer\Finder::create()
            ->in(__DIR__)
            ->exclude('vendor')
            ->exclude('node_modules')
            ->exclude('packages/tableberg/includes/freemius')
            ->exclude('packages/pro/includes/freemius')
    );
