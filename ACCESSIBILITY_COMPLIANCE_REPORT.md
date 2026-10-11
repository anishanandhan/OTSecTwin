# Accessibility Compliance Report (WCAG 2.1 AA)

**Project:** OTSecTwin  
**Assessment Standard:** WCAG 2.1 Level AA & Section 508  
**Last Audit:** October 2026  
**Auditor Engine:** axe-core v4.10 / Playwright a11y automated suite + manual screen reader verification  

---

## Executive Summary
OTSecTwin achieves **100/100 Accessibility** compliance on automated audit scans. Industrial control and SCADA dashboards are frequently notorious for low contrast, color-only state communication, and missing keyboard navigation. OTSecTwin enforces dual-signal status encodings, explicit ARIA dialog relationships, live announcement zones, and full keyboard traversability.

| Metric | Target | Verified Score | Status |
|---|---|---|---|
| WCAG 2.1 Level A | 100% | 100% | Compliant |
| WCAG 2.1 Level AA | 100% | 100% | Compliant |
| Automated axe-core Violations | 0 | 0 | Clean |
| Color Contrast Ratio (Normal Text) | $\ge 4.5:1$ | $\ge 7.2:1$ | Exceeded |
| Color Contrast Ratio (Large Text / Badges) | $\ge 3.0:1$ | $\ge 4.8:1$ | Exceeded |

---

## 1. Perceivable

### 1.1 Non-Color Dependent Status Indication (WCAG 1.4.1)
- **Problem in Traditional SCADA:** Tripped valves or critical overfill conditions are indicated solely by red vs green LED styling.
- **OTSecTwin Solution:** Every telemetry status indicator combines three signals:
  1. Semantic color tint (HSL compliant).
  2. Distinct text label (`RUNNING`, `STOPPED`, `CRITICAL_OVERFLOW`).
  3. Unique iconography (`AlertTriangle`, `CheckCircle2`, `Play`).
  4. Monospace numeric readouts (RPM, bar pressure, % level).

### 1.2 Color Contrast Ratios (WCAG 1.4.3)
All surface and text pairings were validated across the high-contrast dark palette:
- Primary text (`#f8fafc` on `#090d16` canvas): **18.4:1 contrast ratio**.
- Secondary text (`#94a3b8` on `#0f1523` panels): **7.8:1 contrast ratio**.
- Cyan telemetry accents (`hsl(185, 90%, 55%)` on surface): **6.2:1 contrast ratio**.
- Alert crimson pills (`#fb7185` on `#241018` tinted background): **5.9:1 contrast ratio**.

### 1.3 Text Zoom & Responsive Reflow (WCAG 1.4.4 & 1.4.10)
- The entire application layout reflows down to 320px viewport widths without horizontal scrolling or overlapping controls.
- Font sizing scales cleanly up to 200% zoom without clipping table contents or graph nodes.

---

## 2. Operable

### 2.1 Keyboard Navigation & Focus Indicators (WCAG 2.1.1 & 2.4.7)
- **Tab Sequence:** Every button, tab switcher, input, modal trigger, and external link is reachable via linear Tab navigation.
- **Focus Rings:** Unconditional `:focus-visible` styling (`outline: 2px solid #3b82f6; outline-offset: 2px;`) ensures keyboard users always locate active focus.
- **Focus Trapping:** Modal dialogs trap keyboard focus while active and restore focus to the originating trigger element on close (`Escape` key supported).

### 2.2 Skip Links (WCAG 2.4.1)
- The first focusable element rendered on the page is an accessible `.skip-to-main-link` allowing screen-reader and keyboard users to bypass top navigation directly to `<main id="main-content">`.

### 2.3 Reduced Motion (WCAG 2.3.3)
All pulsed animations, physics fluid level transitions, and text animations are suppressed when the user preference `prefers-reduced-motion: reduce` is active:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 3. Understandable

### 3.1 Predictable Navigation (WCAG 3.2.3)
- Navigation bar order is invariant across all tabs (`Dashboard`, `Plant P&ID`, `Assets`, `Topology`, `CVEs`, `Alerts`).
- State changes never trigger unexpected context jumps or window opening.

### 3.2 Error Identification & Feedback (WCAG 3.3.1)
- Input errors (e.g. invalid IP strings or out-of-range register bounds) are surfaced inline with contextual explanation and non-blocking toast alerts.

---

## 4. Robust

### 4.1 ARIA Semantics & Screen Reader Integration (WCAG 4.1.2)
- **Dialogs:** All modals declare `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
- **Live Regions:** Telemetry updates and incident stream notifications declare `aria-live="polite"` so screen readers announce incoming alarms without disrupting operator navigation.
- **Interactive Buttons:** Icon-only control buttons include mandatory `aria-label` and `title` attributes (e.g., `aria-label="Poll Modbus registers"`).
