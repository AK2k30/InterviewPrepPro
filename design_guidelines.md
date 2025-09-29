# Interview Preparation Platform Design Guidelines

## Design Approach: Reference-Based (Professional Video Platforms)
Drawing inspiration from **Zoom, Google Meet, and HireVue** for professional video interface design, combined with modern SaaS platform aesthetics like **Linear and Notion** for clean, trustworthy user experience.

## Core Design Principles
- **Professional Credibility**: Clean, minimal design that builds user confidence
- **Calming Presence**: Reduce interview anxiety through gentle, supportive UI
- **Focus-Driven**: Minimize distractions during video sessions
- **Performance Clarity**: Clear, actionable feedback presentation

## Color Palette

### Primary Colors
- **Brand Primary**: 220 100% 60% (Professional blue)
- **Brand Secondary**: 220 15% 25% (Deep slate)

### Supporting Colors
- **Success**: 142 76% 36% (Muted green for positive feedback)
- **Warning**: 38 92% 50% (Amber for areas of improvement)
- **Background Light**: 220 14% 98%
- **Background Dark**: 220 15% 9%

### Gradients
- **Hero Background**: Subtle 220 100% 60% to 260 100% 55% gradient
- **Card Overlays**: 220 15% 98% to 220 15% 100% (light mode)

## Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight, generous letter-spacing
- **Body**: 400-500 weight, optimized line-height 1.6
- **UI Elements**: 500 weight for buttons and labels

## Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12, 16 units for consistent rhythm
- Cards: p-6 or p-8 for comfortable padding
- Sections: my-12 or my-16 for vertical separation
- Elements: gap-4 or gap-6 for component spacing

## Page-Specific Design

### Landing Page (User Registration)
- **Hero Section**: Full-height with subtle gradient background
- **Form Container**: Centered glass-morphism card (backdrop-blur, subtle border)
- **Input Fields**: Clean, rounded inputs with focus states
- **Role Selection**: Grid of role cards with hover effects and icons

### Video Call Interface
- **Layout**: Primary video occupies 70% of viewport height
- **Controls Bar**: Fixed bottom position with rounded pill container
- **Control Buttons**: Circular buttons with clear icons (camera, mic, end call)
- **Color States**: Red for end call, muted states for disabled controls
- **Background**: Dark gradient (220 15% 5% to 220 15% 15%) to minimize eye strain

### Performance Report
- **Summary Cards**: Grid layout with metrics and scores
- **Feedback Sections**: Expandable cards with detailed analysis
- **Progress Indicators**: Circular progress rings and bar charts
- **Action Items**: Clear next steps with priority indicators

## Component Library

### Navigation
- **Header**: Minimal with logo and user avatar
- **Progress Indicator**: Step-by-step progress for multi-page flow

### Forms
- **Input Style**: Rounded corners, subtle borders, focus-within glow
- **Buttons**: Primary (filled), Secondary (outline), Danger (red)
- **Validation**: Inline feedback with gentle color coding

### Video Components
- **Video Container**: Rounded corners with subtle shadow
- **Control Overlay**: Semi-transparent with backdrop blur
- **Status Indicators**: Connection quality, recording status

### Data Display
- **Score Cards**: Large numeric displays with contextual colors
- **Charts**: Clean, minimal styling with brand color highlights
- **Feedback Panels**: Expandable with clear typography hierarchy

## Accessibility & Interaction
- **Dark Mode**: Full support with adjusted color palette
- **Focus States**: Clear, high-contrast focus indicators
- **Motion**: Minimal, purposeful animations (page transitions, button feedback)
- **Loading States**: Skeleton screens and progress indicators

## Images
No large hero images required. Focus on:
- **Professional Icons**: Use Heroicons for consistency
- **Avatar Placeholders**: Subtle gradients for user profiles
- **Illustrations**: Minimal line art for empty states if needed

This design creates a trustworthy, professional environment that reduces interview anxiety while maintaining the credibility essential for career preparation tools.