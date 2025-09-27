# Design Guidelines: Plataforma Microfinanciera

## Design Approach
**Reference-Based Approach**: Inspired by modern fintech platforms like Nubank and financial services with emphasis on trust, accessibility, and professional credibility. The design should reflect the purple/gradient aesthetic from the provided reference image while maintaining financial industry standards.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Deep Purple: 270 85% 25% (main brand color)
- Medium Purple: 270 70% 45% (interactive elements)
- Light Purple: 270 50% 85% (backgrounds, subtle accents)

**Supporting Colors:**
- White: 0 0% 100% (backgrounds, text on dark)
- Dark Gray: 220 15% 15% (primary text)
- Medium Gray: 220 10% 60% (secondary text)
- Success Green: 142 76% 36% (approved states)
- Warning Orange: 25 95% 53% (pending states)
- Error Red: 0 84% 60% (rejected/error states)

**Gradients:**
- Hero gradient: From 270 85% 25% to 280 70% 45%
- Card overlays: Subtle purple gradients for depth
- Button gradients: From primary to slightly lighter purple

### B. Typography
**Primary Font**: Inter (Google Fonts)
- Headings: 600-700 weight
- Body text: 400-500 weight
- Small text: 400 weight

**Hierarchy:**
- H1: 2.5rem (40px), semibold
- H2: 2rem (32px), semibold  
- H3: 1.5rem (24px), medium
- Body: 1rem (16px), regular
- Small: 0.875rem (14px), regular

### C. Layout System
**Spacing System**: Tailwind units of 4, 6, 8, 12, 16
- Component padding: p-6, p-8
- Section spacing: mb-12, mb-16
- Element margins: m-4, m-6
- Container max-width: max-w-6xl

### D. Component Library

**Navigation:**
- Clean header with logo, navigation links, and prominent "Iniciar Solicitud" CTA
- Sticky navigation with subtle shadow on scroll
- Mobile hamburger menu with overlay

**Forms:**
- Multi-step wizard for registration and pre-solicitud
- Input fields with purple focus states and validation
- File upload areas with drag-and-drop styling
- Progress indicators for multi-step processes
- CAPTCHA integration for anti-spam

**Cards:**
- Service cards with subtle shadows and hover effects
- Status cards for application tracking
- Information cards with purple accent borders

**Buttons:**
- Primary: Purple gradient with white text
- Secondary: Purple outline with purple text
- Success/Warning/Error variants for different states

**Data Displays:**
- Application status dashboard
- Document upload preview
- Verification status indicators

### E. Page Sections

**Hero Section:**
- Large hero with purple gradient background
- Prominent headline about financial services
- Primary CTA button for starting application
- Trust indicators (security badges, client testimonials)

**Services Section:**
- Grid of financial products (préstamos, créditos, etc.)
- Each service with icon, description, and details link
- Purple accent colors for service highlighting

**Process Section:**
- Step-by-step visualization of application process
- Icons and connecting lines showing flow
- Clear descriptions in Spanish

**Trust/Security Section:**
- Information about data protection
- Regulatory compliance badges
- Customer testimonials or success stories

## Images
**Hero Background**: Abstract financial/technology imagery with purple overlay gradient. Should convey innovation, trust, and financial growth.

**Service Icons**: Clean, minimal icons representing different financial products (loan, credit card, savings, etc.) in purple line-art style.

**Process Illustrations**: Simple step-by-step illustrations showing the application process from registration to approval.

**Trust Badges**: Regulatory compliance logos, security certifications, and partner bank logos.

## Key UX Principles
- Clear call-to-action hierarchy focusing on loan applications
- Progressive disclosure for complex forms
- Strong visual feedback for form validation and status updates
- Accessibility-first approach with proper contrast ratios
- Mobile-first responsive design
- Spanish language throughout with clear, simple financial terminology