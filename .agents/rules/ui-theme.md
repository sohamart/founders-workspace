# UI & Theme Guidelines: Founders Workspace (Executive Light Theme)

All new components, pages, cards, and modal dialogs added to Founders Workspace MUST adhere to the **Executive Light Theme** defined by Weblets® × StackAdda™.

## 1. Visual Consistency Rules
- **NEVER use dark or black background cards** (`bg-slate-900`, `bg-black`, `bg-amber-950`) for project cards, internal tasks, or main content blocks. All cards must be crisp white.
- **Card Background**: `bg-white` with `border border-slate-200/90`, rounded corners (`rounded-3xl` for main cards, `rounded-xl` / `rounded-2xl` for sub-cards).
- **Hover Effects**: `hover:border-orange-400 hover:shadow-xl transition-all duration-300` (or `hover:border-amber-400`).
- **Inner Containers**: Soft slate background (`bg-slate-50 border border-slate-200/80 rounded-2xl`).
- **Typography**:
  - Main titles: `text-slate-900 font-bold`
  - Subheaders / Labels: `text-slate-800` or `text-slate-700`
  - Body / Subtext: `text-slate-500` or `text-slate-600`
- **Badges & Pills**:
  - Brand / Client: `bg-orange-50 text-orange-700 border-orange-200`
  - Internal Initiative: `bg-amber-50 text-amber-800 border-amber-200`
  - Completed / Active: `bg-emerald-50 text-emerald-800 border-emerald-200`

## 2. Reusable Primitives
When adding any new feature, always use the reusable primitives from `src/components/common/ThemeUI.jsx`:
- `<PortalCard>`: Standard container card.
- `<PortalSection>`: Inner grouping container.
- `<PortalSubCard>`: Nested item or milestone card.
- `<PortalBadge variant="orange|amber|emerald|blue|slate">`: Uniform badges.
- `<PortalButton variant="primary|secondary|amber|ghost">`: Uniform buttons.
- `<PortalProgressBar value={...} />`: Progress bar.
- `<PortalStatBox label="..." value="..." icon={Icon} />`: Stats or specs box.
- `<PortalInput />`: Standard form inputs.

Or use the CSS utility classes from `src/index.css`:
- `.portal-card`
- `.portal-card-interactive`
- `.portal-section`
- `.portal-subcard`
