<?php

declare(strict_types=1);

/*
 * This file is part of PHP CS Fixer.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *     Dariusz Rumiński <dariusz.ruminski@gmail.com>
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace PhpCsFixer\Fixer\PhpUnit;

use PhpCsFixer\Fixer\AbstractPhpUnitFixer;
use PhpCsFixer\Fixer\ClassNotation\OrderedClassElementsFixer;
use PhpCsFixer\Fixer\ConfigurableFixerInterface;
use PhpCsFixer\Fixer\ConfigurableFixerTrait;
use PhpCsFixer\FixerConfiguration\FixerConfigurationResolver;
use PhpCsFixer\FixerConfiguration\FixerConfigurationResolverInterface;
use PhpCsFixer\FixerConfiguration\FixerOptionBuilder;
use PhpCsFixer\FixerDefinition\CodeSample;
use PhpCsFixer\FixerDefinition\FixerDefinition;
use PhpCsFixer\FixerDefinition\FixerDefinitionInterface;
use PhpCsFixer\Tokenizer\Analyzer\DataProviderAnalyzer;
use PhpCsFixer\Tokenizer\Tokens;

/**
 * @phpstan-type _AutogeneratedInputConfiguration array{
 *  placement?: 'after'|'before',
 * }
 * @phpstan-type _AutogeneratedComputedConfiguration array{
 *  placement: 'after'|'before',
 * }
 *
 * @implements ConfigurableFixerInterface<_AutogeneratedInputConfiguration, _AutogeneratedComputedConfiguration>
 *
 * @phpstan-import-type _ClassElement from OrderedClassElementsFixer
 */
final class PhpUnitDataProviderMethodOrderFixer extends AbstractPhpUnitFixer implements ConfigurableFixerInterface
{
    /** @use ConfigurableFixerTrait<_AutogeneratedInputConfiguration, _AutogeneratedComputedConfiguration> */
    use ConfigurableFixerTrait;

    public function getDefinition(): FixerDefinitionInterface
    {
        return new FixerDefinition(
            'Data provider method must be placed after/before the last/first test where used.',
            [
                new CodeSample(
                    '<?php
class FooTest extends TestCase {
    public function dataProvider() {}
    /**
     * @dataProvider dataProvider
     */
    public function testSomething($expected, $actual) {}
}
',
                ),
                new CodeSample(
                    '<?php
class FooTest extends TestCase {
    /**
     * @dataProvider dataProvider
     */
    public function testSomething($expected, $actual) {}
    public function dataProvider() {}
}
',
                    [
                        'placement' => 'before',
                    ]
                ),
            ]
        );
    }

    /**
     * {@inheritdoc}
     *
     * Must run before ClassAttributesSeparationFixer, NoBlankLinesAfterClassOpeningFixer.
     * Must run after OrderedClassElementsFixer.
     */
    public function getPriority(): int
    {
        return 64;
    }

    protected function createConfigurationDefinition(): FixerConfigurationResolverInterface
    {
        return new FixerConfigurationResolver([
            (new FixerOptionBuilder('placement', 'Where to place the data provider relative to the test where used.'))
                ->setAllowedValues(['after', 'before'])
                ->setDefault('after')
                ->getOption(),
        ]);
    }

    protected function applyPhpUnitClassFix(Tokens $tokens, int $startIndex, int $endIndex): void
    {
        $elements = $this->getElements($tokens, $startIndex);

        if (0 === \count($elements)) {
            return;
        }

        $endIndex = $elements[array_key_last($elements)]['end'];

        $dataProvidersWithUsagePairs = $this->getDataProvidersWithUsagePairs($tokens, $startIndex, $endIndex);
        $origUsageDataProviderOrderPairs = $this->getOrigUsageDataProviderOrderPairs($dataProvidersWithUsagePairs);

        $sorted = $elements;
        $providersPlaced = [];
        if ('before' === $this->configuration['placement']) {
            foreach ($origUsageDataProviderOrderPairs as [$usageName, $providerName]) {
                if (!isset($providersPlaced[$providerName])) {
                    $providersPlaced[$providerName] = true;

                    $sorted = $this->moveMethodElement($sorted, $usageName, $providerName, false);
                }
            }
        } else {
            $sameUsageName = false;
            $sameProviderName = false;
            foreach ($origUsageDataProviderOrderPairs as [$usageName, $providerName]) {
                if (!isset($providersPlaced[$providerName])) {
                    $providersPlaced[$providerName] = true;

                    $sortedBefore = $sorted;
                    $sorted = $this->moveMethodElement(
                        $sorted,
                        $usageName === $sameUsageName // @phpstan-ignore argument.type (https://github.com/phpstan/phpstan/issues/12482)
                            ? $sameProviderName
                            : $usageName,
                        $providerName,
                        true
                    );

                    // honor multiple providers order for one test
                    $sameUsageName = $usageName;
                    $sameProviderName = $providerName;

                    // keep placement after the first test
                    if ($sortedBefore !== $sorted) {
                        unset($providersPlaced[$providerName]);
                    }
                }
            }
        }

        if ($sorted !== $elements) {
            $this->sortTokens($tokens, $startIndex, $endIndex, $sorted);
        }
    }

    /**
     * @return list<_ClassElement>
     */
    private function getElements(Tokens $tokens, int $startIndex): array
    {
        $methodOrderFixer = new OrderedClassElementsFixer();

        return \Closure::bind(static fn () => $methodOrderFixer->getElements($tokens, $startIndex), null, OrderedClassElementsFixer::class)();
    }

    /**
     * @param list<_ClassElement> $elements
     */
    private function sortTokens(Tokens $tokens, int $startIndex, int $endIndex, array $elements): void
    {
        $methodOrderFixer = new OrderedClassElementsFixer();

        \Closure::bind(static fn () => $methodOrderFixer->sortTokens($tokens, $startIndex, $endIndex, $elements), null, OrderedClassElementsFixer::class)();
    }

    /**
     * @param list<_ClassElement> $elements
     *
     * @return list<_ClassElement>
     */
    private function moveMethodElement(array $elements, string $nameKeep, string $nameToMove, bool $after): array
    {
        $i = 0;
        $iKeep = false;
        $iToMove = false;
        foreach ($elements as $element) {
            if ('method' === $element['type']) {
                if ($element['name'] === $nameKeep) {
                    $iKeep = $i;
                } elseif ($element['name'] === $nameToMove) {
                    $iToMove = $i;
                }
            }

            ++$i;
        }
        \assert(false !== $iKeep);
        \assert(false !== $iToMove);

        if ($iToMove === $iKeep + ($after ? 1 : -1)) {
            return $elements;
        }

        $elementToMove = $elements[$iToMove]; // @phpstan-ignore offsetAccess.notFound
        unset($elements[$iToMove]);

        $c = $iKeep
            + ($after ? 1 : 0)
            + ($iToMove < $iKeep ? -1 : 0);

        return [
            ...\array_slice($elements, 0, $c),
            $elementToMove,
            ...\array_slice($elements, $c),
        ];
    }

    /**
     * @return list<array{
     *   array{int, string},
     *   non-empty-array<int, array{int, string, int}>
     * }>
     */
    private function getDataProvidersWithUsagePairs(Tokens $tokens, int $startIndex, int $endIndex): array
    {
        $dataProvidersWithUsagePairs = [];

        $dataProviderAnalyzer = new DataProviderAnalyzer();
        foreach ($dataProviderAnalyzer->getDataProviders($tokens, $startIndex, $endIndex) as $dataProviderAnalysis) {
            $usages = [];
            foreach ($dataProviderAnalysis->getUsageIndices() as $usageIndex) {
                $methodNameTokens = $tokens->findSequence([[\T_FUNCTION], [\T_STRING]], $usageIndex[0], $endIndex);
                if (null === $methodNameTokens) {
                    continue;
                }

                $usages[array_key_last($methodNameTokens)] = [
                    array_key_last($methodNameTokens),
                    end($methodNameTokens)->getContent(),
                    $usageIndex[1],
                ];
            }
            \assert([] !== $usages);

            $dataProvidersWithUsagePairs[] = [
                [$dataProviderAnalysis->getNameIndex(), $dataProviderAnalysis->getName()],
                $usages,
            ];
        }

        return $dataProvidersWithUsagePairs;
    }

    /**
     * @param list<array{
     *   array{int, string},
     *   non-empty-array<int, array{int, string, int}>
     * }> $dataProvidersWithUsagePairs
     *
     * @return list<array{string, string}>
     */
    private function getOrigUsageDataProviderOrderPairs(array $dataProvidersWithUsagePairs): array
    {
        $origUsagesOrderPairs = [];
        foreach ($dataProvidersWithUsagePairs as [$dataProviderPair, $usagePairs]) {
            foreach ($usagePairs as $usagePair) {
                $origUsagesOrderPairs[] = [$usagePair, $dataProviderPair[1]];
            }
        }
        uasort($origUsagesOrderPairs, static function (array $a, array $b): int {
            $cmp = $a[0][0] <=> $b[0][0];

            return 0 !== $cmp
                ? $cmp
                : $a[0][2] <=> $b[0][2];
        });

        $origUsageDataProviderOrderPairs = [];
        foreach (array_map(static fn (array $v): array => [$v[0][1], $v[1]], $origUsagesOrderPairs) as [$usageName, $providerName]) {
            $origUsageDataProviderOrderPairs[] = [$usageName, $providerName];
        }

        return $origUsageDataProviderOrderPairs;
    }
}
