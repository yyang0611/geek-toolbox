# Geek Toolbox Version 1 Growth Features Design

Date: 2026-05-09
Status: Approved

## Goal

Launch a focused Version 1 that improves both:
- social sharing potential
- repeat-visit retention

The release should avoid broad feature sprawl and instead validate a simple growth loop:
1. users discover visually compelling, easy-to-share tools
2. users get useful output quickly
3. users return because the toolbox remembers their common paths

## Version 1 Scope

This version includes three main additions:
1. Screenshot Annotation
2. Code/Text to Image Card
3. Recent Tools + Favorite Tools (site-wide retention layer)

The intent is not to turn the product into a full editor suite. The intent is to strengthen the existing local-first toolbox with a small set of high-leverage features.

## Product Strategy

Version 1 should prioritize:
- visible output
- short time-to-result
- strong homepage discovery
- lightweight retention mechanisms

This means:
- Screenshot Annotation drives practical repeat usage and shareable output
- Code/Text to Image Card drives social-friendly output and spread
- Recent/Favorites turns one-time traffic into recurring usage

## Information Architecture

Keep the current single-page toolbox structure.
Do not convert the site into a multi-page application in Version 1.

Enhance the homepage with four priority sections:
1. Recommended Tools
2. Recent Tools
3. Favorite Tools
4. Existing categorized tool list

### Homepage Ordering

Recommended first, so new users immediately see the most growth-oriented tools.
Recent and Favorites next, so returning users can resume quickly.
The existing toolbox catalog remains available below without breaking current habits.

### Homepage Categories

Recommended grouping:
- Recommended
- Image Tools
- Text & Code
- File Conversion
- Developer Utilities
- Recent Tools
- Favorite Tools

This provides a cleaner structure for future expansion.

## Feature 1: Screenshot Annotation

### Positioning

A lightweight in-browser utility for quickly explaining screenshots.
The product goal is speed and clarity, not advanced design workflows.

### Core Use Cases

- add arrows to screenshots
- highlight areas with rectangles
- add explanation text
- add numbered markers
- hide sensitive information with mosaic/blur
- export a clean result for tutorials, bug reports, or social sharing

### Required Capabilities

- upload image via click or drag-and-drop
- support PNG, JPG, WEBP
- arrow tool
- rectangle tool
- text tool
- numbered marker tool
- mosaic or blur redaction tool
- select/delete annotations
- undo and redo
- export as PNG
- preserve original aspect ratio

### Recommended Capabilities

- color presets
- line width selection
- font size selection
- clear-all action
- canvas zoom preview

### Explicit Non-Goals for Version 1

- multi-image workflows
- freehand brush system
- layer panel
- collaborative editing
- share links
- advanced typography controls

### UX Flow

1. user uploads a screenshot
2. tool opens directly in the annotation canvas
3. user applies simple annotations from a compact toolbar
4. preview updates immediately
5. user exports PNG

### Success Criteria

The default path should feel obvious enough that a first-time user can finish without reading instructions.

## Feature 2: Code/Text to Image Card

### Positioning

A lightweight card generator that converts plain text into polished, shareable image output.
This tool should serve code snippets, JSON, logs, chat excerpts, lists, and short written content.

### Core Use Cases

- share code snippets as an image
- turn JSON or logs into a readable card
- create short social-post cards from plain text
- make clean screenshots unnecessary for some text-sharing scenarios

### Required Capabilities

- multiline text input
- real-time preview
- dark theme
- light theme
- default spacing and rounded card styling
- automatic line wrapping
- PNG export
- high-resolution output

### Recommended Capabilities

- size presets: square, portrait, landscape
- content modes: plain text, code, JSON
- optional title bar/window style
- simple background styles such as solid or gradient
- copy image to clipboard

### Explicit Non-Goals for Version 1

- cloud save
- AI rewriting or beautification
- full rich-text editor
- large theme marketplace
- deep syntax-highlighting system

### UX Flow

1. user pastes text
2. preview renders immediately
3. user selects theme and size if needed
4. user exports image

### Success Criteria

The tool should generate a good-looking result within a few seconds with minimal adjustment.

## Site-Wide Retention Layer

### Recent Tools

Purpose: help returning users resume their workflow immediately.

#### Required
- record tool opens automatically
- keep the latest 5 to 8 tools
- display them prominently on the homepage
- persist them with localStorage

#### Recommended
- sort by most recent use
- empty-state guidance
- clear history action

#### Non-Goals
- cross-device sync
- analytics dashboard
- cloud history

### Favorite Tools

Purpose: let users create a personal quick-access workspace.

#### Required
- allow favorite/unfavorite on each tool card
- dedicated homepage favorites section
- persist favorites with localStorage

#### Recommended
- visual highlight for favorited tools
- empty-state guidance
- soft cap of around 8 to 12 favorites

#### Non-Goals
- favorite folders
- drag-and-drop sort
- cloud sync
- shared collections

## Homepage Recommendation Area

Version 1 should visibly promote the two new hero tools.

### Recommended Tool Cards

Card 1:
- title: Screenshot Annotation
- supporting copy: Add arrows, text, and mosaic to screenshots
- intent: tutorials, bug reports, social sharing

Card 2:
- title: Text to Image Card
- supporting copy: Turn code or text into a shareable image card
- intent: posts, communities, notes, dev sharing

### Presentation

These cards should be visually larger than standard tool cards.
Use concise outcome-oriented copy and a clear primary CTA such as “Use Now”.
A small NEW badge is acceptable.

## Interaction Principles

- shortest possible path from input to result
- immediate visual preview
- clear action feedback
- useful empty states
- lightweight defaults that already look good
- show the result first, advanced settings second

## Error Handling

### Screenshot Annotation
Handle:
- unsupported image formats
- oversized images causing performance issues
- export failures
- canvas initialization failures

Use short, actionable messages.
Examples:
- unsupported format, please upload PNG, JPG, or WEBP
- image is too large, try compressing it first
- export failed, please try again

### Code/Text to Image Card
Handle:
- empty input
- overflow/very long content
- export failures
- special character rendering issues

Examples:
- please enter some content first
- long content has been wrapped automatically
- export failed, please try again

### Recent/Favorites
Handle:
- localStorage unavailable
- corrupt local data
- duplicate favorite actions

The app should degrade gracefully. Storage failure must not block the tools themselves.

## Launch-Critical Experience Requirements

### Mobile Usability

At minimum, mobile users must be able to:
- discover the new tools
- upload content
- interact with controls
- scroll previews
- export results

Desktop can remain the primary editing experience, but mobile must remain usable.

### Export Quality

This is critical for product perception.

Screenshot Annotation exports must avoid:
- blurry output
- shifted text
- misplaced arrows/shapes

Text to Image Card exports must avoid:
- broken wrapping
- unstable spacing
- low-resolution output

### Performance

Keep homepage load light.
New tools should initialize lazily or only when used when possible.
Do not make the landing experience heavy just to support advanced editing logic.

### Copywriting

Tool names alone are not enough.
Homepage labels should clearly state the outcome, such as:
- Add arrows, text, and mosaic to screenshots
- Turn code/text into a shareable card

## Testing Guidance

### Screenshot Annotation
Verify:
- PNG/JPG/WEBP upload
- arrow/text/box/number annotations
- mosaic/blur behavior
- undo/redo
- export alignment consistency
- large-image handling

### Code/Text to Image Card
Verify:
- Chinese and English mixed text
- long-text wrapping
- code-like content rendering
- theme switching
- export size presets
- image sharpness

### Recent/Favorites
Verify:
- tool-open tracking
- refresh persistence
- favorite/unfavorite stability
- bilingual UI copy coverage
- graceful behavior if localStorage fails

## Recommendation

Proceed with this Version 1 release order:
1. Screenshot Annotation
2. Code/Text to Image Card
3. Recent Tools + Favorite Tools

If sequencing inside implementation matters, Recent/Favorites can be developed in parallel because it is a site-wide but lower-complexity layer.

## Final Design Summary

This Version 1 is intentionally narrow.
It is designed to prove that Geek Toolbox can grow not by adding random small utilities, but by combining:
- more shareable outcomes
- more obvious homepage discovery
- more reusable personal workflows

That is the core growth hypothesis this release should validate.
