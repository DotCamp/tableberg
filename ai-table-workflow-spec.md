# AI Table Feature Workflow Specification

## Overview

AI Table is a Pro feature for Tableberg that enables users to create tables using artificial intelligence. The feature follows a one-shot generation philosophy: AI creates a starting point, users perfect it in the editor.

## Core Principles

1. **Simplicity First**: Designed for non-technical users
2. **One-Shot Generation**: No regeneration loops
3. **User Control**: AI assists, humans refine
4. **Cost Conscious**: Transparent, predictable API usage
5. **Pro Feature**: Available exclusively to Tableberg Pro users

## Table Creation Methods

### 1. Context-Aware (From Page Content)
Generate tables based on existing content in the current post/page

### 2. Prompt-Based (From Description)
Create tables from natural language descriptions

### 3. Screenshot-Based (From Image)
Recreate tables from uploaded screenshots

## Initial Setup Flow

### First-Time User Experience

When clicking "AI Table" for the first time:

```
Welcome to AI Tables! ✨

To use AI features, you'll need an OpenAI API key.
It's like a password that lets Tableberg talk to AI.

[Get Your API Key] → Opens guide
[I Have a Key]     → Shows input field
[Watch Tutorial]   → 2-minute setup video
```

### API Key Configuration

**Location**: Tableberg Pro → AI Settings

```
🤖 AI Configuration
├── API Key: ••••••••••••••sk-xyz [Change]
├── Status: ✓ Connected
└── [Test Connection]
```

**Key Storage**: 
- Encrypted in WordPress database
- Never exposed to frontend
- Validated on save

## Detailed Workflows

### Method 1: Context-Aware Table Generation

#### Entry Point
In the table creator modal, click "AI Table" button

#### User Flow
1. **Selection Screen**
   ```
   Create AI Table from Page Content
   
   AI will analyze your current page and suggest 
   a relevant table structure.
   
   [Generate Table from Page] [Cancel]
   ```

2. **Processing**
   ```
   ✨ Analyzing your content...
   [Progress bar]
   ```

3. **Completion**
   ```
   ✅ Table inserted! 
   Edit it using the block controls.
   ```

#### Behind the Scenes
- Extract text content from current post/page
- Identify lists, comparisons, data points
- Generate appropriate table structure
- Insert as Tableberg blocks

### Method 2: Prompt-Based Generation

#### Entry Point
Same table creator modal → "AI Table" button

#### User Flow
1. **Input Screen**
   ```
   Create AI Table
   
   Describe what table you need:
   [Large text input area]
   
   Examples:
   • "Pricing table with Basic ($9), Pro ($29), Enterprise ($99)"
   • "Compare iPhone 15, 15 Pro, and 15 Pro Max features"
   • "Weekly schedule Monday to Friday, 9am to 5pm"
   
   Quick Templates:
   [Comparison] [Pricing] [Schedule] [Features] [Data]
   
   [Generate & Insert Table] [Cancel]
   ```

2. **Processing**
   ```
   ✨ Creating your table...
   [Progress indicator]
   ```

3. **Completion**
   ```
   ✅ Table inserted!
   Edit any cell by clicking on it.
   ```

#### Template System
Clicking a template pre-fills the prompt:
- **Comparison**: "Create a comparison table for [products] with features like [list key features]"
- **Pricing**: "Create a pricing table with 3 tiers: Basic, Pro, and Enterprise"
- **Schedule**: "Create a weekly schedule table for Monday through Friday"
- **Features**: "Create a feature comparison table with checkmarks"
- **Data**: "Create a data table with columns for [specify columns]"

### Method 3: Screenshot-Based Recreation

#### Entry Point
Same as above

#### User Flow
1. **Upload Screen**
   ```
   Create AI Table from Screenshot
   
   [Drop zone with upload icon]
   Drop a table screenshot here
   or click to browse
   
   Supported formats: PNG, JPG, GIF
   Max size: 5MB
   
   [Cancel]
   ```

2. **Processing Steps**
   ```
   ✨ Processing image...
   → Detecting table structure...
   → Extracting content...
   → Creating table blocks...
   [Progress bar with status updates]
   ```

3. **Completion**
   ```
   ✅ Table recreated!
   Review and edit as needed.
   ```

## User Interface Components

### Table Creator Modal Update
```
Current buttons:
- Pre-Built Table
- WooCommerce Table  
- Data Table (CSV, XML) [Coming Soon]
- AI Table [NEW - Pro]
- Posts Table [Coming Soon]
```

### AI Table Modal Structure
```
┌─────────────────────────────────────┐
│  AI Table          [Pro]        [X] │
├─────────────────────────────────────┤
│                                     │
│  How would you like to create      │
│  your table?                        │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ From    │ │ From    │ │ From   ││
│  │ Page    │ │ Prompt  │ │ Image  ││
│  │ Content │ │         │ │        ││
│  └─────────┘ └─────────┘ └────────┘│
│                                     │
└─────────────────────────────────────┘
```

## Error Handling

### API Key Errors
```
Connection Issue:
"Hmm, that key didn't work. Let's try again!"
[Check Key] [Get Help]

Missing Key:
"You'll need to add your OpenAI API key first"
[Go to Settings] [Learn More]
```

### Generation Errors
```
Failed Generation:
"Couldn't create the table. Try:"
• Simpler description
• Check internet connection
• Verify API key in settings

[Use Template Instead] [Cancel]
```

### Cost/Limit Errors
```
"Your OpenAI account might be out of credits"
[Check OpenAI Account] [Learn More]
```

## Technical Implementation

### API Integration

#### Server-Side Proxy
```php
// All API calls go through WordPress backend
class Tableberg_AI_Service {
    private $api_key;
    
    public function generate_table($prompt, $method) {
        // Validate API key
        // Prepare prompt based on method
        // Call OpenAI API
        // Parse response to Tableberg blocks
        // Return block markup
    }
}
```

#### Block Generation Format
```javascript
// AI returns structured data converted to:
{
    name: 'tableberg/table',
    attributes: {
        rows: 3,
        cols: 4,
        hasHeader: true
    },
    innerBlocks: [
        {
            name: 'tableberg/cell',
            attributes: { row: 0, col: 0 },
            innerBlocks: [
                {
                    name: 'core/paragraph',
                    attributes: { content: 'Cell content' }
                }
            ]
        }
        // ... more cells
    ]
}
```

### API Prompt Templates

#### Context-Aware Prompt
```
Given the following WordPress post content:
[POST_CONTENT]

Create a table that summarizes or organizes this information.
Return as structured JSON with rows and columns.
```

#### User Prompt Enhancement
```
User request: [USER_INPUT]

Create a table following these requirements:
- Use appropriate headers
- Include relevant data
- Make it scannable and organized
- Return as structured JSON

Format: { headers: [], rows: [[]] }
```

#### Screenshot Analysis Prompt
```
[Image data]

Recreate this table structure with the visible content.
Maintain the same layout and organization.
Return as structured JSON.
```

## Usage Tracking

### Simple Metrics Display
```
AI Usage This Month:
▓▓▓▓▓░░░░░ 12 tables created

✓ Most tables use less than $0.05 of AI credits
ℹ️ Your OpenAI account is charged directly
```

### No Complex Analytics
- Count of tables generated
- Success/failure rate
- No token counting shown to users

## Help & Documentation

### In-Context Help
1. **Tooltips** on all interactive elements
2. **Example prompts** in placeholder text
3. **Status messages** during generation

### Help Resources
```
Need Help?
• Setup Guide: How to get your API key
• Video Tutorial: Create your first AI table
• FAQ: Common questions answered
• Support: Contact Pro support
```

## Future Enhancements (Phase 2+)

1. **Additional AI Providers**
   - Anthropic Claude
   - Google Gemini
   - Custom endpoints

2. **Advanced Features**
   - Batch table generation
   - Table style learning
   - Custom prompt templates

3. **Community Features**
   - Share successful prompts
   - Table template library
   - Usage best practices

## Development Checklist

### Phase 1: Core Implementation
- [ ] API key settings page
- [ ] Basic prompt-based generation
- [ ] Server-side OpenAI integration
- [ ] Block structure generation
- [ ] Error handling
- [ ] Basic UI modal

### Phase 2: Enhanced Features
- [ ] Context-aware generation
- [ ] Template system
- [ ] Usage tracking
- [ ] Improved error messages
- [ ] Help documentation

### Phase 3: Advanced Features
- [ ] Screenshot upload
- [ ] OCR integration
- [ ] Multiple provider support
- [ ] Advanced templates
- [ ] Performance optimization

## Security Considerations

1. **API Key Security**
   - Encrypted storage
   - Server-side only usage
   - No client exposure

2. **Input Validation**
   - Sanitize user prompts
   - Limit prompt length
   - Rate limiting per user

3. **Output Validation**
   - Verify AI response structure
   - Sanitize generated content
   - Limit table size

## Success Metrics

1. **User Adoption**
   - % of Pro users using AI Tables
   - Tables generated per user
   - Feature retention rate

2. **Quality Metrics**
   - Edit rate after generation
   - Time saved vs manual creation
   - User satisfaction scores

3. **Technical Metrics**
   - API success rate
   - Average generation time
   - Error frequency

---

*This document serves as the complete specification for the AI Table feature in Tableberg Pro.*