# Founders Workspace UI & Theme Guide (Executive Light Theme)

This document provides the standard design system guidelines for **Weblets® × StackAdda™ Founders Workspace**.

Whenever you or any AI agent adds new features, pages, or components to this project, follow this guide to ensure all UI matches seamlessly.

---

## 🎨 Core Theme Tokens

| Element | Specification | Tailwind Classes / Values |
| :--- | :--- | :--- |
| **Card Background** | Pure Crisp White | `bg-white` |
| **Card Borders** | Subtle Slate | `border border-slate-200/90` |
| **Card Radius** | Executive Pill Rounded | `rounded-3xl` (cards), `rounded-2xl` (sections), `rounded-xl` (buttons/inputs) |
| **Card Shadows** | Soft Elevation | `shadow-sm hover:shadow-xl` |
| **Card Hover** | Brand Accent Glow | `hover:border-orange-400` or `hover:border-amber-400` |
| **Inner Sections** | Soft Slate Fill | `bg-slate-50 border border-slate-200/80` |
| **Brand Gradient** | Orange to Amber | `bg-gradient-to-r from-orange-600 to-amber-600` |
| **Text Primary** | Deep Slate | `text-slate-900` |
| **Text Secondary** | Medium Slate | `text-slate-600` or `text-slate-500` |

---

## 🧩 Reusable UI Components

Import directly from `src/components/common/ThemeUI.jsx`:

```jsx
import { 
  PortalCard, 
  PortalSection, 
  PortalSubCard, 
  PortalBadge, 
  PortalButton, 
  PortalProgressBar,
  PortalStatBox,
  PortalInput 
} from '../common/ThemeUI';

// Example Usage:
export const MyNewFeature = () => (
  <PortalCard interactive hoverBorder="orange">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-bold text-slate-900">Feature Title</h3>
      <PortalBadge variant="orange">Active</PortalBadge>
    </div>

    <PortalSection className="mt-4">
      <PortalStatBox label="Lead Founder" value="Soham Dutta" />
      <PortalProgressBar value={75} />
    </PortalSection>

    <div className="mt-4 flex gap-2">
      <PortalButton variant="primary">Save Changes</PortalButton>
      <PortalButton variant="secondary">Cancel</PortalButton>
    </div>
  </PortalCard>
);
```

---

## 🛠️ Direct CSS Classes

You can also use the CSS classes declared in `src/index.css`:

```html
<div class="portal-card portal-card-interactive">
  <div class="portal-section">
    <div class="portal-subcard">Nested item</div>
  </div>
</div>
```
