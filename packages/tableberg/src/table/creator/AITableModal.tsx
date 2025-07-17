import { useState, useEffect } from "react";
import {
    Button,
    TextareaControl,
    Notice,
    Spinner,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { createBlock } from "@wordpress/blocks";
import LoadingState from "./components/LoadingState";
import PromptInput from "./components/PromptInput";
import CustomModal from "../../components/CustomModal";
import "./ai-table-modal.scss";

interface Props {
    onClose: () => void;
    onInsert: (block: any) => void;
}

type GenerationMethod = "prompt" | "context" | "image";
type ModalState = "method-selection" | "input" | "processing" | "error";

interface AISettings {
    api_key?: string;
    enabled?: boolean;
    ajax?: {
        generateTable?: {
            url: string;
            action: string;
            nonce: string;
        };
    };
}

declare global {
    interface Window {
        tablebergAdminMenuData?: {
            ai_settings?: AISettings;
        };
    }
}

interface AIStatus {
    configured: boolean;
    is_pro: boolean;
    has_api_key?: boolean;
    enabled?: boolean;
    message: string;
}

export default function AITableModal({ onClose, onInsert }: Props) {
    const [method, setMethod] = useState<GenerationMethod | null>(null);
    const [state, setState] = useState<ModalState>("method-selection");
    const [prompt, setPrompt] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [extractedContent, setExtractedContent] = useState({
        content: "",
        wordCount: 0,
        isWithinLimits: true
    });

    // Check AI configuration status on mount
    useEffect(() => {
        const checkAIStatus = async () => {
            try {
                const status = (await apiFetch({
                    path: "/tableberg/v1/ai/status",
                    method: "GET",
                })) as AIStatus;
                setAiStatus(status);
            } catch (err) {
                console.error("Failed to check AI status:", err);
                // Fallback to checking if user is Pro
                setAiStatus({
                    configured: TABLEBERG_CFG.IS_PRO,
                    is_pro: TABLEBERG_CFG.IS_PRO,
                    message: TABLEBERG_CFG.IS_PRO
                        ? __("AI Table is available", "tableberg")
                        : __("AI Table requires Tableberg Pro", "tableberg"),
                });
            } finally {
                setIsCheckingStatus(false);
            }
        };

        checkAIStatus();
    }, []);

    // Extract content from current post/page using block editor API
    const extractCurrentContent = async () => {
        try {
            // Use block editor API to get content
            const { select } = (window as any).wp?.data || {};
            
            if (!select) {
                fallbackContentExtraction();
                return;
            }
            
            // Get all blocks from the editor
            const blocks = select('core/block-editor')?.getBlocks?.() || [];
            
            // Extract content from all blocks with deduplication
            const extractedParts: string[] = [];
            const processedBlocks = new Set<string>();
            
            blocks.forEach((block: any) => {
                const content = extractBlockContent(block, processedBlocks);
                if (content.trim()) {
                    extractedParts.push(content);
                }
            });
            
            let extractedText = extractedParts.join('\n\n');
            
            // If no content was extracted, try server-side rendering as last resort
            if (!extractedText.trim()) {
                try {
                    const serverContent = await extractViaServer(blocks);
                    if (serverContent) {
                        extractedText = cleanExtractedContent(serverContent);
                    }
                } catch (error) {
                    console.error('Server-side extraction failed:', error);
                }
            }
            
            // Clean and deduplicate the final content
            extractedText = cleanExtractedContent(extractedText);
            
            // Calculate word count
            const words = extractedText.trim().split(/\s+/).filter(word => word.length > 0);
            const wordCount = words.length;
            const isWithinLimits = wordCount < 3000;
            
            setExtractedContent({
                content: extractedText.trim(),
                wordCount,
                isWithinLimits
            });
        } catch (error) {
            console.error('Error extracting content:', error);
            // Fallback to existing method
            fallbackContentExtraction();
        }
    };

    // Extract content from a single block and its inner blocks using multiple methods
    const extractBlockContent = (block: any, processedBlocks: Set<string> = new Set()): string => {
        if (!block || !block.clientId) return '';
        
        // Skip if already processed (deduplication)
        if (processedBlocks.has(block.clientId)) {
            return '';
        }
        
        processedBlocks.add(block.clientId);
        let content = '';
        
        try {
            // Method 1: Try innerHTML first (most reliable for third-party blocks)
            if (block.innerHTML) {
                content = cleanHtmlContent(block.innerHTML);
                if (isValidContent(content)) {
                    // Only process inner blocks if parent has no meaningful content
                    if (block.innerBlocks && Array.isArray(block.innerBlocks) && block.innerBlocks.length > 0) {
                        const innerContent = block.innerBlocks.map(innerBlock => 
                            extractBlockContent(innerBlock, processedBlocks)
                        ).filter(c => c.trim()).join('\n\n');
                        
                        if (innerContent.trim()) {
                            content = content.trim() + '\n\n' + innerContent;
                        }
                    }
                    return content;
                }
            }
            
            // Method 2: Try originalContent (some blocks store original content here)
            if (block.originalContent) {
                content = cleanHtmlContent(block.originalContent);
                if (isValidContent(content)) {
                    return content;
                }
            }
            
            // Method 3: Try DOM-based extraction from rendered block
            content = extractFromRenderedBlock(block);
            if (isValidContent(content)) {
                return content;
            }
            
            // Method 4: Try comprehensive attribute extraction
            if (block.attributes) {
                content = extractFromAttributes(block);
                if (isValidContent(content)) {
                    return content;
                }
            }
            
            // Method 5: Try getBlockContent as fallback
            const blockContent = (window as any).wp?.blocks?.getBlockContent?.(block) || '';
            if (blockContent) {
                content = cleanHtmlContent(blockContent);
                if (isValidContent(content)) {
                    return content;
                }
            }
            
            // If no content found in parent, process inner blocks
            if (block.innerBlocks && Array.isArray(block.innerBlocks) && block.innerBlocks.length > 0) {
                const innerContents = block.innerBlocks.map(innerBlock => 
                    extractBlockContent(innerBlock, processedBlocks)
                ).filter(c => c.trim());
                
                if (innerContents.length > 0) {
                    return innerContents.join('\n\n');
                }
            }
        } catch (error) {
            console.error('Error extracting block content:', error);
        }
        
        return '';
    };

    // Clean HTML content and remove CSS/technical artifacts
    const cleanHtmlContent = (htmlContent: string): string => {
        if (!htmlContent) return '';
        
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            
            // Remove style and script tags
            const styleTags = tempDiv.querySelectorAll('style, script, link');
            styleTags.forEach(tag => tag.remove());
            
            // Remove empty elements and those with only whitespace
            const allElements = tempDiv.querySelectorAll('*');
            allElements.forEach(element => {
                if (!element.textContent?.trim()) {
                    element.remove();
                }
            });
            
            // Get text content
            let content = tempDiv.textContent || tempDiv.innerText || '';
            
            // Clean up common CSS artifacts and technical strings
            content = content
                .replace(/\\s*{[^}]*}/g, '') // Remove CSS blocks
                .replace(/\\s*@[\\w-]+\\s*[^;]*;/g, '') // Remove CSS at-rules
                .replace(/\\s*[.#][\\w-]+\\s*[{:]/g, '') // Remove CSS selectors
                .replace(/\\s*display\\s*:\\s*[^;]*;?/gi, '') // Remove display properties
                .replace(/\\s*position\\s*:\\s*[^;]*;?/gi, '') // Remove position properties
                .replace(/\\s*margin\\s*:\\s*[^;]*;?/gi, '') // Remove margin properties
                .replace(/\\s*padding\\s*:\\s*[^;]*;?/gi, '') // Remove padding properties
                .replace(/\\s*color\\s*:\\s*[^;]*;?/gi, '') // Remove color properties
                .replace(/\\s*background\\s*:\\s*[^;]*;?/gi, '') // Remove background properties
                .replace(/\\s*font-[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove font properties
                .replace(/\\s*width\\s*:\\s*[^;]*;?/gi, '') // Remove width properties
                .replace(/\\s*height\\s*:\\s*[^;]*;?/gi, '') // Remove height properties
                .replace(/\\s*z-index\\s*:\\s*[^;]*;?/gi, '') // Remove z-index properties
                .replace(/\\s*transform\\s*:\\s*[^;]*;?/gi, '') // Remove transform properties
                .replace(/\\s*transition\\s*:\\s*[^;]*;?/gi, '') // Remove transition properties
                .replace(/\\s*animation\\s*:\\s*[^;]*;?/gi, '') // Remove animation properties
                .replace(/\\s*border[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove border properties
                .replace(/\\s*box-shadow\\s*:\\s*[^;]*;?/gi, '') // Remove box-shadow
                .replace(/\\s*text-[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove text properties
                .replace(/\\s*line-height\\s*:\\s*[^;]*;?/gi, '') // Remove line-height
                .replace(/\\s*vertical-align\\s*:\\s*[^;]*;?/gi, '') // Remove vertical-align
                .replace(/\\s*overflow[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove overflow properties
                .replace(/\\s*flex[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove flex properties
                .replace(/\\s*grid[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove grid properties
                .replace(/\\s*align[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove align properties
                .replace(/\\s*justify[\\w-]*\\s*:\\s*[^;]*;?/gi, '') // Remove justify properties
                .replace(/rgb\\([^)]*\\)/g, '') // Remove RGB colors
                .replace(/#[0-9a-fA-F]{3,6}/g, '') // Remove hex colors
                .replace(/\\s*!important/gi, '') // Remove !important
                .replace(/\\s*(px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\\b/g, '') // Remove units
                .replace(/\\s*@media[^{]*{[^{}]*({[^{}]*}[^{}]*)*}/g, '') // Remove media queries
                .replace(/\\s*@keyframes[^{]*{[^{}]*({[^{}]*}[^{}]*)*}/g, '') // Remove keyframes
                .replace(/\\s*[\\w-]+\\s*=\\s*[\"'][^\"']*[\"']/g, '') // Remove HTML attributes
                .replace(/\\s*class\\s*=\\s*[\"'][^\"']*[\"']/gi, '') // Remove class attributes
                .replace(/\\s*id\\s*=\\s*[\"'][^\"']*[\"']/gi, '') // Remove id attributes
                .replace(/\\s*style\\s*=\\s*[\"'][^\"']*[\"']/gi, '') // Remove inline styles
                .replace(/\\s*data-[\\w-]*\\s*=\\s*[\"'][^\"']*[\"']/gi, '') // Remove data attributes
                .replace(/\\s*aria-[\\w-]*\\s*=\\s*[\"'][^\"']*[\"']/gi, '') // Remove aria attributes
                .replace(/\\s*(undefined|null|NaN)\\s*/g, ' ') // Remove undefined/null/NaN
                .replace(/\\s*\\[object\\s+Object\\]/g, '') // Remove [object Object]
                .replace(/\\s*function\\s*\\([^)]*\\)\\s*{[^}]*}/g, '') // Remove function definitions
                .replace(/\\s*var\\s+[\\w$]+\\s*=\\s*[^;]*;?/g, '') // Remove variable declarations
                .replace(/\\s*const\\s+[\\w$]+\\s*=\\s*[^;]*;?/g, '') // Remove const declarations
                .replace(/\\s*let\\s+[\\w$]+\\s*=\\s*[^;]*;?/g, '') // Remove let declarations
                .replace(/\\s*document\\.[\\w.()]*;?/g, '') // Remove document references
                .replace(/\\s*window\\.[\\w.()]*;?/g, '') // Remove window references
                .replace(/\\s*console\\.[\\w.()]*;?/g, '') // Remove console references
                .replace(/\\s*jQuery\\.[\\w.()]*;?/g, '') // Remove jQuery references
                .replace(/\\s*\\$\\([^)]*\\)\\.[\\w.()]*;?/g, '') // Remove jQuery selectors
                .replace(/\\s*addEventListener\\s*\\([^)]*\\)\\s*{[^}]*}/g, '') // Remove event listeners
                .replace(/\\s*onclick\\s*=\\s*[\"'][^\"']*[\"']/gi, '') // Remove onclick handlers
                .replace(/\\s*on[\\w]+\\s*=\\s*[\"'][^\"']*[\"']/gi, '') // Remove event handlers
                .replace(/\\s*href\\s*=\\s*[\"']javascript:[^\"']*[\"']/gi, '') // Remove javascript links
                .replace(/\\s*src\\s*=\\s*[\"']data:[^\"']*[\"']/gi, '') // Remove data URLs
                .replace(/\\s+/g, ' ') // Normalize whitespace
                .trim();
            
            return content;
        } catch (error) {
            console.error('Error cleaning HTML content:', error);
            return '';
        }
    };
    
    // Check if content is valid and meaningful
    const isValidContent = (content: string): boolean => {
        if (!content || content.trim().length < 3) return false;
        
        // Check if content is mostly CSS/HTML artifacts
        const cssPatterns = [
            /^[.#][\w-]+$/,  // CSS selectors
            /^\s*[\w-]+\s*:\s*[^;]*;?$/,  // CSS properties
            /^\s*@[\w-]+/,  // CSS at-rules
            /^\s*{[^}]*}$/,  // CSS blocks
            /^\s*[\w-]+\s*=\s*["'][^"']*["']$/,  // HTML attributes
            /^\s*(class|id|style|data-[\w-]*|aria-[\w-]*)\s*=\s*["'][^"']*["']$/,  // Specific attributes
            /^\s*(undefined|null|NaN|function|var|const|let)\s/,  // JavaScript keywords
            /^\s*[0-9.]+\s*(px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\s*$/,  // CSS units
            /^\s*(rgb|rgba|hsl|hsla)\s*\(/,  // CSS color functions
            /^\s*#[0-9a-fA-F]{3,6}\s*$/,  // Hex colors
            /^\s*[\w-]+\s*{[^}]*}\s*$/,  // CSS rules
            /^\s*\$\([^)]*\)/,  // jQuery selectors
            /^\s*document\./,  // Document references
            /^\s*window\./,  // Window references
            /^\s*console\./,  // Console references
        ];
        
        const trimmedContent = content.trim();
        
        // Check if content matches any CSS/HTML pattern
        for (const pattern of cssPatterns) {
            if (pattern.test(trimmedContent)) {
                return false;
            }
        }
        
        // Check if content is mostly special characters or numbers
        const alphaNumericCount = (trimmedContent.match(/[a-zA-Z0-9]/g) || []).length;
        const totalLength = trimmedContent.length;
        
        if (alphaNumericCount / totalLength < 0.6) {
            return false;
        }
        
        // Check for common non-content strings
        const nonContentStrings = [
            'block-editor', 'wp-block', 'components-', 'editor-', 'gutenberg-',
            'undefined', 'null', 'NaN', 'true', 'false', 'function', 'return',
            'var', 'const', 'let', 'document', 'window', 'console', 'jQuery',
            'addEventListener', 'onclick', 'className', 'innerHTML', 'textContent',
            'querySelector', 'getElementById', 'getElementsBy', 'setAttribute',
            'getAttribute', 'classList', 'style', 'display', 'position',
            'margin', 'padding', 'border', 'background', 'color', 'font',
            'width', 'height', 'top', 'left', 'right', 'bottom', 'z-index',
            'transform', 'transition', 'animation', 'flex', 'grid', 'absolute',
            'relative', 'fixed', 'sticky', 'hidden', 'visible', 'overflow',
            'important', 'media', 'keyframes', 'rgba', 'rgb', 'hsl', 'hsla'
        ];
        
        const lowerContent = trimmedContent.toLowerCase();
        let nonContentCount = 0;
        
        for (const str of nonContentStrings) {
            if (lowerContent.includes(str)) {
                nonContentCount++;
            }
        }
        
        // If more than 30% of common non-content strings are found, likely not meaningful content
        if (nonContentCount > nonContentStrings.length * 0.3) {
            return false;
        }
        
        return true;
    };
    
    // Clean and deduplicate extracted content
    const cleanExtractedContent = (content: string): string => {
        if (!content) return '';
        
        // Split into lines and clean each line
        const lines = content.split('\n').map(line => line.trim()).filter(line => {
            return line.length > 0 && isValidContent(line);
        });
        
        // Remove duplicate lines
        const uniqueLines = [...new Set(lines)];
        
        // Remove lines that are substrings of other lines
        const filteredLines = uniqueLines.filter((line, index) => {
            return !uniqueLines.some((otherLine, otherIndex) => {
                return index !== otherIndex && otherLine.includes(line) && otherLine.length > line.length;
            });
        });
        
        return filteredLines.join('\n\n');
    };

    // Extract content from DOM-rendered block
    const extractFromRenderedBlock = (block: any): string => {
        try {
            if (!block.clientId) return '';
            
            // Try to find the block in the DOM using its clientId
            const selectors = [
                `[data-block="${block.clientId}"]`,
                `#block-${block.clientId}`,
                `.wp-block[data-block="${block.clientId}"]`,
                `.block-editor-block-list__block[data-block="${block.clientId}"]`
            ];
            
            for (const selector of selectors) {
                const blockElement = document.querySelector(selector);
                if (blockElement) {
                    const content = cleanHtmlContent(blockElement.innerHTML || '');
                    if (isValidContent(content)) {
                        return content;
                    }
                }
            }
            
            return '';
        } catch (error) {
            console.error('Error extracting from rendered block:', error);
            return '';
        }
    };

    // Extract content from block attributes using comprehensive approach
    const extractFromAttributes = (block: any): string => {
        let content = '';
        
        try {
            // Handle specific core block types first
            switch (block.name) {
                case 'core/paragraph':
                case 'core/heading':
                    const paragraphContent = cleanHtmlContent(block.attributes.content || '');
                    if (isValidContent(paragraphContent)) {
                        content += paragraphContent;
                    }
                    break;
                case 'core/list':
                    const listContent = cleanHtmlContent(block.attributes.values || '');
                    if (isValidContent(listContent)) {
                        content += listContent;
                    }
                    break;
                case 'core/quote':
                    const quoteContent = cleanHtmlContent(block.attributes.value || '');
                    if (isValidContent(quoteContent)) {
                        content += quoteContent;
                    }
                    break;
                case 'core/code':
                case 'core/preformatted':
                    const codeContent = cleanHtmlContent(block.attributes.content || '');
                    if (isValidContent(codeContent)) {
                        content += codeContent;
                    }
                    break;
                case 'core/table':
                    // Extract table content
                    if (block.attributes.body && Array.isArray(block.attributes.body)) {
                        const tableContent = block.attributes.body.map((row: any) => {
                            if (row.cells && Array.isArray(row.cells)) {
                                return row.cells.map((cell: any) => {
                                    const cellContent = cleanHtmlContent(cell.content || '');
                                    return isValidContent(cellContent) ? cellContent : '';
                                }).filter(c => c).join(' ');
                            }
                            return '';
                        }).filter(r => r).join('\n');
                        
                        if (isValidContent(tableContent)) {
                            content += tableContent;
                        }
                    }
                    break;
                default:
                    // For third-party blocks, try common attribute patterns
                    const commonContentAttrs = [
                        'content', 'text', 'value', 'html', 'body', 'description', 
                        'title', 'heading', 'caption', 'alt', 'label', 'message',
                        'excerpt', 'summary', 'intro', 'subtitle', 'tagline'
                    ];
                    
                    for (const attr of commonContentAttrs) {
                        if (block.attributes[attr]) {
                            let attrContent = '';
                            if (typeof block.attributes[attr] === 'string') {
                                attrContent = cleanHtmlContent(block.attributes[attr]);
                            } else if (Array.isArray(block.attributes[attr])) {
                                attrContent = block.attributes[attr].map(item => 
                                    typeof item === 'string' ? cleanHtmlContent(item) : item
                                ).join(' ');
                            }
                            
                            if (isValidContent(attrContent)) {
                                content += attrContent + ' ';
                            }
                        }
                    }
                    
                    // If no common attributes found, extract all string attributes
                    if (!content.trim()) {
                        Object.values(block.attributes).forEach((value: any) => {
                            if (typeof value === 'string' && value.length > 3) {
                                const cleanedValue = cleanHtmlContent(value);
                                if (isValidContent(cleanedValue)) {
                                    content += cleanedValue + ' ';
                                }
                            }
                        });
                    }
                    
                    if (content.trim()) {
                        content = content.trim();
                    }
            }
        } catch (error) {
            console.error('Error extracting from attributes:', error);
        }
        
        return content;
    };

    // Extract content via server-side rendering
    const extractViaServer = async (blocks: any[]): Promise<string> => {
        try {
            const response = await apiFetch({
                path: '/tableberg/v1/ai/extract-blocks',
                method: 'POST',
                data: { blocks }
            }) as any;
            
            return response.content || '';
        } catch (error) {
            console.error('Server extraction failed:', error);
            return '';
        }
    };

    // Fallback content extraction method
    const fallbackContentExtraction = () => {
        try {
            // Fallback to current method if block editor API fails
            const content = (window as any).wp?.data?.select('core/editor')?.getEditedPostContent?.() || '';
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            
            const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
            const wordCount = words.length;
            const isWithinLimits = wordCount < 3000;
            
            setExtractedContent({
                content: plainText.trim(),
                wordCount,
                isWithinLimits
            });
        } catch (error) {
            console.error('Error in fallback content extraction:', error);
            setExtractedContent({
                content: '',
                wordCount: 0,
                isWithinLimits: true
            });
        }
    };

    // Auto-extract content when switching to content method
    useEffect(() => {
        if (method === "content" && !extractedContent.content) {
            extractCurrentContent();
        }
    }, [method]);

    const generateTable = async () => {
        // Validate input based on method
        if (method === "prompt" && !prompt.trim()) {
            setError(__("Please enter a table description", "tableberg"));
            return;
        }
        
        if (method === "content" && !extractedContent.content.trim()) {
            setError(__("Please provide content for analysis", "tableberg"));
            return;
        }

        setState("processing");
        setIsGenerating(true);
        setError(null);

        try {
            const requestData: any = {
                method: method,
            };
            
            if (method === "prompt") {
                requestData.prompt = prompt;
            } else if (method === "content") {
                requestData.content = extractedContent.content;
                // Get current post ID if available
                const postId = (window as any).wp?.data?.select('core/editor')?.getCurrentPostId?.();
                if (postId) {
                    requestData.post_id = postId;
                }
            }

            const response = (await apiFetch({
                path: "/tableberg/v1/ai/generate-table",
                method: "POST",
                data: requestData,
            })) as any;

            console.log("AI Table API Response:", response);

            if (response.success && response.block) {
                // Recursively create blocks from the response
                const createBlocksFromData = (blockData: any): any => {
                    if (!blockData) return null;

                    // If it's an array, process each item
                    if (Array.isArray(blockData)) {
                        return blockData.map((block) =>
                            createBlocksFromData(block),
                        );
                    }

                    // Create innerBlocks recursively
                    const innerBlocks = blockData.innerBlocks
                        ? createBlocksFromData(blockData.innerBlocks).filter(
                              Boolean,
                          )
                        : [];

                    // Create the block with proper structure
                    return createBlock(
                        blockData.name,
                        blockData.attributes || {},
                        innerBlocks,
                    );
                };

                const block = createBlocksFromData(response.block);
                console.log("Created block:", block);

                if (block) {
                    onInsert(block);
                    onClose();
                } else {
                    throw new Error(
                        __("Failed to create block from response", "tableberg"),
                    );
                }
            } else {
                throw new Error(
                    response.message ||
                        __("Failed to generate table", "tableberg"),
                );
            }
        } catch (err: any) {
            console.error("AI Table generation error:", err);
            setState("error");

            // Check for specific error types
            if (
                err.code === "invalid_json" ||
                err.message?.includes("Unexpected token")
            ) {
                setError(
                    __(
                        "Invalid response from server. Please make sure the AI Table add-on is properly activated.",
                        "tableberg",
                    ),
                );
            } else if (err.code === "rest_no_route") {
                setError(
                    __(
                        "AI Table service not available. Please make sure the Pro version is activated and refresh the page.",
                        "tableberg",
                    ),
                );
            } else if (err.code === "ai_table_timeout") {
                setError(
                    __(
                        "The AI service is taking longer than expected to respond. This can happen with large content or high server load. Please try again with shorter content or try again later.",
                        "tableberg",
                    ),
                );
            } else if (err.code === "ai_table_content_too_large") {
                setError(
                    err.message ||
                        __(
                            "Content is too large for AI processing. Please reduce the content length and try again.",
                            "tableberg",
                        ),
                );
            } else if (err.code === "ai_table_request_failed") {
                setError(
                    __(
                        "Failed to connect to AI service. Please check your internet connection and try again.",
                        "tableberg",
                    ),
                );
            } else {
                setError(
                    err.message ||
                        __(
                            "An error occurred while generating the table",
                            "tableberg",
                        ),
                );
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const renderMethodSelection = () => (
        <div className="tableberg-ai-modal-methods">
            <h3>
                {__("How would you like to create your table?", "tableberg")}
            </h3>
            <div className="tableberg-ai-modal-method-grid">
                <button
                    className="tableberg-ai-modal-method"
                    onClick={() => {
                        setMethod("prompt");
                        setState("input");
                    }}
                >
                    <span className="tableberg-ai-modal-method-icon">✏️</span>
                    <span className="tableberg-ai-modal-method-title">
                        {__("From Prompt", "tableberg")}
                    </span>
                    <span className="tableberg-ai-modal-method-desc">
                        {__("Describe the table you want", "tableberg")}
                    </span>
                </button>

                <button
                    className="tableberg-ai-modal-method"
                    onClick={() => {
                        setMethod("content");
                        setState("input");
                    }}
                >
                    <span className="tableberg-ai-modal-method-icon">📄</span>
                    <span className="tableberg-ai-modal-method-title">
                        {__("From Page Content", "tableberg")}
                    </span>
                    <span className="tableberg-ai-modal-method-desc">
                        {__("Analyze current page", "tableberg")}
                    </span>
                </button>

                <button
                    className="tableberg-ai-modal-method tableberg-ai-modal-method--disabled"
                    disabled
                    title={__("Coming soon", "tableberg")}
                >
                    <span className="tableberg-ai-modal-method-icon">🖼️</span>
                    <span className="tableberg-ai-modal-method-title">
                        {__("From Image", "tableberg")}
                    </span>
                    <span className="tableberg-ai-modal-method-desc">
                        {__("Upload a screenshot", "tableberg")}
                    </span>
                </button>
            </div>
        </div>
    );

    const renderInput = () => {
        if (method === "prompt") {
            return (
                <PromptInput
                    value={prompt}
                    onChange={setPrompt}
                    onGenerate={generateTable}
                    isGenerating={isGenerating}
                />
            );
        }

        if (method === "content") {
            return (
                <div className="tableberg-ai-modal-content-input">
                    <h3>{__("Generate Table from Content", "tableberg")}</h3>
                    <p>{__("AI will analyze this content and create a relevant table. You can edit the content below if needed.", "tableberg")}</p>
                    
                    <div className="tableberg-ai-modal-content-preview">
                        <TextareaControl
                            value={extractedContent.content}
                            onChange={(value) => {
                                const words = value.trim().split(/\s+/).filter(word => word.length > 0);
                                const wordCount = words.length;
                                const isWithinLimits = wordCount < 3000;
                                
                                setExtractedContent({
                                    content: value,
                                    wordCount,
                                    isWithinLimits
                                });
                            }}
                            placeholder={__("Content will be auto-extracted from your current post...", "tableberg")}
                            rows={8}
                            className="tableberg-ai-modal-content-textarea"
                        />
                        <div className="tableberg-ai-modal-content-status">
                            <span className={`tableberg-ai-modal-word-count ${extractedContent.isWithinLimits ? 'within-limits' : 'exceeds-limits'}`}>
                                {extractedContent.wordCount} words {extractedContent.isWithinLimits ? '✓' : '⚠️ May be truncated'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="tableberg-ai-modal-content-actions">
                        <Button
                            variant="secondary"
                            onClick={extractCurrentContent}
                            disabled={isGenerating}
                        >
                            {__("Re-extract from Post", "tableberg")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={generateTable}
                            disabled={isGenerating || !extractedContent.content.trim()}
                        >
                            {isGenerating ? __("Generating...", "tableberg") : __("Generate Table", "tableberg")}
                        </Button>
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderHeader = () => {
        if (isCheckingStatus || !aiStatus?.is_pro || !aiStatus?.configured) {
            return null;
        }

        return (
            <div className="tableberg-ai-modal-header">
                {state === "input" && (
                    <Button
                        variant="tertiary"
                        onClick={() => {
                            setState("method-selection");
                            setMethod(null);
                            setError(null);
                        }}
                        className="tableberg-ai-modal-back"
                    >
                        ← {__("Back to methods", "tableberg")}
                    </Button>
                )}
                
                <div className="tableberg-ai-modal-breadcrumb">
                    {state === "method-selection" && (
                        <span className="tableberg-ai-modal-breadcrumb-current">
                            {__("Choose Method", "tableberg")}
                        </span>
                    )}
                    {state === "input" && method && (
                        <>
                            <span className="tableberg-ai-modal-breadcrumb-step">
                                {__("Choose Method", "tableberg")}
                            </span>
                            <span className="tableberg-ai-modal-breadcrumb-separator">›</span>
                            <span className="tableberg-ai-modal-breadcrumb-current">
                                {method === "prompt" && __("From Prompt", "tableberg")}
                                {method === "content" && __("From Page Content", "tableberg")}
                                {method === "image" && __("From Image", "tableberg")}
                            </span>
                        </>
                    )}
                    {(state === "processing" || state === "error") && method && (
                        <>
                            <span className="tableberg-ai-modal-breadcrumb-step">
                                {__("Choose Method", "tableberg")}
                            </span>
                            <span className="tableberg-ai-modal-breadcrumb-separator">›</span>
                            <span className="tableberg-ai-modal-breadcrumb-step">
                                {method === "prompt" && __("From Prompt", "tableberg")}
                                {method === "content" && __("From Page Content", "tableberg")}
                                {method === "image" && __("From Image", "tableberg")}
                            </span>
                            <span className="tableberg-ai-modal-breadcrumb-separator">›</span>
                            <span className="tableberg-ai-modal-breadcrumb-current">
                                {state === "processing" && __("Generating", "tableberg")}
                                {state === "error" && __("Error", "tableberg")}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (isCheckingStatus) {
            return (
                <div className="tableberg-ai-modal-loading">
                    <Spinner />
                    <p>{__("Checking AI configuration...", "tableberg")}</p>
                </div>
            );
        }

        if (!aiStatus?.is_pro) {
            return (
                <div className="tableberg-ai-modal-configure">
                    <Notice status="warning" isDismissible={false}>
                        {__(
                            "AI Table feature requires Tableberg Pro",
                            "tableberg",
                        )}
                    </Notice>
                    <p>
                        {__(
                            "Upgrade to Tableberg Pro to unlock AI-powered table generation and other premium features.",
                            "tableberg",
                        )}
                    </p>
                    <Button
                        variant="primary"
                        href="https://dotcamp.com/tableberg"
                        target="_blank"
                    >
                        {__("Upgrade to Pro", "tableberg")}
                    </Button>
                </div>
            );
        }

        if (!aiStatus?.configured) {
            return (
                <div className="tableberg-ai-modal-configure">
                    <Notice status="warning" isDismissible={false}>
                        {aiStatus.message ||
                            __(
                                "AI Table generation requires configuration.",
                                "tableberg",
                            )}
                    </Notice>
                    <p>
                        {__(
                            "Please configure your OpenAI API key in the Tableberg settings to use AI features.",
                            "tableberg",
                        )}
                    </p>
                    <Button
                        variant="primary"
                        href={`${window.location.origin}/wp-admin/admin.php?page=tableberg-settings&route=settings`}
                        target="_blank"
                    >
                        {__("Go to Settings", "tableberg")}
                    </Button>
                </div>
            );
        }

        return (
            <>
                {renderHeader()}
                <div className="tableberg-ai-modal-content">
                    {(() => {
                        switch (state) {
                            case "method-selection":
                                return renderMethodSelection();

                            case "input":
                                return renderInput();

                            case "processing":
                                return (
                                    <LoadingState
                                        message={__("Creating your table...", "tableberg")}
                                    />
                                );

                            case "error":
                                return (
                                    <div className="tableberg-ai-modal-error">
                                        <Notice status="error" isDismissible={false}>
                                            {error}
                                        </Notice>
                                        <div className="tableberg-ai-modal-actions">
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setState("input");
                                                    setError(null);
                                                }}
                                            >
                                                {__("Try Again", "tableberg")}
                                            </Button>
                                            <Button 
                                                variant="tertiary" 
                                                onClick={() => {
                                                    setState("method-selection");
                                                    setMethod(null);
                                                    setError(null);
                                                }}
                                            >
                                                {__("Choose Different Method", "tableberg")}
                                            </Button>
                                        </div>
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })()}
                </div>
                <div className="tableberg-ai-modal-footer">
                    <Button
                        variant="primary"
                        onClick={generateTable}
                        disabled={isGenerating || 
                            (method === "prompt" && !prompt.trim()) || 
                            (method === "content" && !extractedContent.content.trim())}
                    >
                        {isGenerating
                            ? __("Generating...", "tableberg")
                            : __("Generate & Insert Table", "tableberg")}
                    </Button>
                </div>
            </>
        );
    };

    return (
        <CustomModal
            title={__("AI Table", "tableberg")}
            onRequestClose={onClose}
            className="tableberg-ai-modal"
            isDismissible={!isGenerating}
            shouldCloseOnClickOutside={!isGenerating}
        >
            {renderContent()}
        </CustomModal>
    );
}
