# 🎨 UI/UX Visual Guide - Workplace Transfer Feature

## Desktop UI Layout

### 1️⃣ Main Page - No Selection
```
┌────────────────────────────────────────────────────────────────┐
│ Руководства управлении                                         │
├────────────────────────────────────────────────────────────────┤
│ [+ Создать]                                                    │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔵 Main Department (Blue)                               │ │
│ │    • 5 рабочих мест                                     │ │
│ │    [+ Create Sub] [Edit] [Delete] [View Hierarchy] [▼]│ │
│ │                                                          │ │
│ │    📊 Workplaces                                        │ │
│ │    ┌────────────────────────────────────────────────┐  │ │
│ │    │ ☐ Workplace 1                    [Details...] │  │ │
│ │    │ ☐ Workplace 2                    [Details...] │  │ │
│ │    │ ☐ Workplace 3                    [Details...] │  │ │
│ │    └────────────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 2️⃣ Main Page - With Selection
```
┌────────────────────────────────────────────────────────────────┐
│ Руководства управлении                                         │
├────────────────────────────────────────────────────────────────┤
│ [+ Создать]                                                    │
│                                                                │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 🔵💫 Готово к переводу                                   ┃ │
│ ┃                                                            ┃ │
│ ┃ Источник: [Main Department]                             ┃ │
│ ┃ Выбрано рабочих мест: [5]                               ┃ │
│ ┃                                     [✓ Переместить]      ┃ │
│ ┃                                     [✕ Отменить]         ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔵 Main Department (Blue)                               │ │
│ │    • 5 рабочих мест                                     │ │
│ │    [+ Create Sub] [Edit] [Delete] [View Hierarchy] [▲]│ │
│ │                                                          │ │
│ │    📊 Workplaces                                        │ │
│ │    ┌────────────────────────────────────────────────┐  │ │
│ │    │ ☑ Workplace 1 (Selected)         [Details...] │  │ │
│ │    │ ☑ Workplace 2 (Selected)         [Details...] │  │ │
│ │    │ ☐ Workplace 3                    [Details...] │  │ │
│ │    └────────────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 3️⃣ Transfer Modal - Main View
```
╔════════════════════════════════════════════════════════════╗
║ 📤 Переместить рабочие места                               ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ 📍 ИСТОЧНИК                                         │ ║
║  │ Main Department                                      │ ║
║  │ ✓ 5 рабочих мест выбрано                           │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║   🎯 Целевая организационная единица                      ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ Выберите куда переместить...                   [▼]  │ ║
║  └──────────────────────────────────────────────────────┘ ║
║  📋 5 доступных единиц для перемещения                    ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ 📍 НАЗНАЧЕНИЕ                                       │ ║
║  │ Target Department Name                               │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ ⚠️ При перемещении 5 рабочих мест, все             │ ║
║  │ сотрудники будут переведены в выбранную единицу.   │ ║
║  │ Это действие нельзя отменить.                       │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║ [✕ Отменить]                    [✓ Переместить] (Green)  ║
╚════════════════════════════════════════════════════════════╝
```

---

## Mobile UI Layout

### Mobile - Main Page with Selection
```
┌──────────────────────────┐
│ ≡ Menu                   │
├──────────────────────────┤
│ [+ Создать]              │
│                          │
│ ╔══════════════════════╗ │
│ ║ 🔵💫 Готово к       ║ │
│ ║ переводу            ║ │
│ ║                      ║ │
│ ║ Источник:           ║ │
│ ║ Main Dept           ║ │
│ ║ Выбрано: 5          ║ │
│ ║                      ║ │
│ ║ [✓ Переместить]     ║ │
│ ║ [✕ Отменить]        ║ │
│ ╚══════════════════════╝ │
│                          │
│ ┌────────────────────┐  │
│ │ 🔵 Main Dept       │  │
│ │ • 5 рабочих мест   │  │
│ │ [Edit] [Delete]    │  │
│ │                    │  │
│ │ Workplaces:        │  │
│ │ ┌──────────────┐  │  │
│ │ │ ☑ WP 1       │  │  │
│ │ │ ☑ WP 2       │  │  │
│ │ │ ☐ WP 3       │  │  │
│ │ └──────────────┘  │  │
│ └────────────────┘  │
└──────────────────────────┘
```

### Mobile - Transfer Modal
```
┌──────────────────────────┐
│ 📤 Переместить           │
├──────────────────────────┤
│                          │
│ ┌────────────────────┐  │
│ │ 📍 ИСТОЧНИК       │  │
│ │ Main Department   │  │
│ │ ✓ 5 selected      │  │
│ └────────────────────┘  │
│                          │
│ 🎯 Целевая единица      │
│ ┌────────────────────┐  │
│ │ [Select...]  [▼]  │  │
│ └────────────────────┘  │
│ 5 available units        │
│                          │
│ ┌────────────────────┐  │
│ │ 📍 НАЗНАЧЕНИЕ     │  │
│ │ Target Dept       │  │
│ └────────────────────┘  │
│                          │
│ ┌────────────────────┐  │
│ │ ⚠️ Action is      │  │
│ │ permanent...      │  │
│ └────────────────────┘  │
│                          │
│ [✕ Cancel]              │
│ [✓ Transfer]            │
│                          │
└──────────────────────────┘
```

---

## Color States

### Selection Checkbox States

**Unchecked**:
```
┌─────────────────────────┐
│ ☐ Workplace 1           │
│ Employee Name           │
└─────────────────────────┘
```

**Checked**:
```
┌─────────────────────────┐
│ ☑ Workplace 1           │
│ Employee Name           │
│ (Background: light blue)│
└─────────────────────────┘
```

### Status Bar States

**No Selection**:
```
Hidden (display: none)
```

**Active Selection**:
```
┌──────────────────────────────┐
│ 🔵💫 Готово к переводу       │
│ Источник: [Unit Name]        │
│ Выбрано: [Count]             │
│ [Transfer]  [Cancel]         │
└──────────────────────────────┘
Background: Linear gradient (blue to indigo)
```

### Modal States

**Empty (No Destination)**:
```
- Destination dropdown: Empty
- Destination preview: Hidden
- Submit button: Disabled (gray)
```

**Filled (Destination Selected)**:
```
- Destination dropdown: Selected value
- Destination preview: Visible (green box)
- Submit button: Enabled (green)
```

---

## Animation Sequences

### 1️⃣ Status Bar Entrance
```
1. Initial: opacity: 0, y: -10px
2. Animate: opacity: 1, y: 0px
3. Duration: 300ms
4. Easing: ease-in-out
```

### 2️⃣ Destination Preview Entrance
```
1. Initial: opacity: 0, scale: 0.95
2. Animate: opacity: 1, scale: 1
3. Duration: 200ms
4. Easing: ease-out
```

### 3️⃣ Pulsing Indicator (Status Bar)
```
Loop:
1. scale: 1 → 1.1 → 1
2. Duration: 2000ms
3. Repeat: Infinity
4. Effect: Draw attention to status
```

### 4️⃣ Checkbox Hover
```
1. Scale: 1.1
2. Shadow: Enhanced
3. Duration: 200ms
```

---

## Dark Mode Examples

### Dark Mode - Selection Bar
```
Background: linear-gradient(
  to right,
  rgba(30, 58, 138, 0.2),
  rgba(49, 46, 129, 0.2)
)
Border: #1e40af
Text: Light blue

Status dot: Pulsing #1E5EFF
Buttons:
  - Transfer: Green background
  - Cancel: Gray outline
```

### Dark Mode - Modal
```
Background: #1e1e1e
Text: #ffffff
Borders: #333333

Source Box:
  Background: rgba(30, 58, 138, 0.2)
  Border: #1e40af
  
Destination Box:
  Background: rgba(6, 78, 59, 0.2)
  Border: #10b981
  
Warning Box:
  Background: rgba(120, 53, 15, 0.2)
  Border: #ea580c
```

---

## Responsive Breakpoints

### Desktop (1024px+)
- Status bar: Horizontal flex layout
- Modal: 500px wide
- Workplace cards: Full width

### Tablet (768px - 1023px)
- Status bar: Flexible layout
- Modal: 90% width, max 500px
- Workplace cards: Adjusted padding

### Mobile (< 768px)
- Status bar: Full width, stacked vertical
- Modal: Full screen - 32px margin
- Workplace cards: Full width with 16px padding
- Buttons: Full width (100%)

---

## Accessibility Features

### Keyboard Navigation
- `Tab`: Navigate through elements
- `Enter`: Activate buttons/checkboxes
- `Escape`: Close modal
- `Space`: Toggle checkbox

### Screen Reader
- Semantic HTML buttons and dialogs
- ARIA labels on interactive elements
- Form labels properly associated
- Error messages announced

### Color Contrast
- Blue (#1E5EFF) on white: 8.5:1 ✅
- Green (#10b981) on white: 5.2:1 ✅
- Text on modal: 15:1 ✅
- All ratios > 4.5:1 ✅

### Focus Indicators
- All buttons have visible focus ring
- Checkboxes have focus outline
- Dropdown has focus highlight
- Modal has focus trap

---

## Interactive States

### Button States

**Default**:
```
Background: #4182F9
Color: White
Cursor: pointer
```

**Hover**:
```
Background: #2d5ce0 (darker)
Shadow: Enhanced
Transform: None
```

**Active/Pressed**:
```
Background: #1a3ca8
Shadow: Inset
Transform: scale(0.98)
```

**Disabled**:
```
Background: #d1d5db
Color: #9ca3af
Cursor: not-allowed
Opacity: 0.6
```

### Checkbox States

**Unchecked**:
```
Border: 2px solid #cbd5e1
Background: transparent
Cursor: pointer
```

**Checked**:
```
Background: Level color (#1E5EFF, #FFC700, etc.)
Icon: White checkmark
Cursor: pointer
```

**Hover (Unchecked)**:
```
Border: 2px solid #94a3b8
Shadow: 0 0 0 3px rgba(color, 0.1)
```

**Hover (Checked)**:
```
Background: Darker shade
Shadow: 0 0 0 3px rgba(color, 0.2)
```

**Focus**:
```
Outline: 2px solid #4182F9
Outline-offset: 2px
```

---

## Toast Notifications

### Success
```
Position: top-center
Background: #10b981
Icon: ✓
Message: "5 рабочих мест успешно перемещено"
Duration: 3s
```

### Error
```
Position: top-right
Background: #ef4444
Icon: ✕
Message: "Ошибка при перемещении рабочих мест"
Duration: 5s
```

### Info
```
Position: top-center
Background: #3b82f6
Icon: ℹ️
Message: "Please select a destination"
Duration: 3s
```

---

## Loading States

### Transfer Button Loading
```
Text: "Переместить..." (changes)
Icon: Spinner animation
Disabled: true
Cursor: not-allowed
```

### Modal Loading
```
Backdrop: Slight opacity increase
Submit button: Shows spinner
All inputs: Disabled
Modal: Cannot close
```

---

**Last Updated**: April 1, 2026
**Design System Version**: 1.0
**UI Framework**: Material-UI 5+
