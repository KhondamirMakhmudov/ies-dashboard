# 🔧 Developer Quick Reference - Workplace Transfer Feature

## Quick Start

### 1. Import the Modal
```javascript
import TransferWorkplacesModal from "@/components/modal/transfer-workplaces-modal";
```

### 2. Add State Management
```javascript
const [transferModal, setTransferModal] = useState(false);
const [selectedWorkplaces, setSelectedWorkplaces] = useState([]);
const [sourceUnitId, setSourceUnitId] = useState(null);
const [destinationUnitId, setDestinationUnitId] = useState(null);
```

### 3. Add Helper Functions
```javascript
const onToggleWorkplaceSelection = (workplaceId) => {
  setSelectedWorkplaces((prev) =>
    prev.includes(workplaceId)
      ? prev.filter((id) => id !== workplaceId)
      : [...prev, workplaceId],
  );
};

const getSourceUnitName = () => {
  // Find and return source unit name
};

const collectAllUnits = (units, collected = []) => {
  // Flatten hierarchy for dropdown options
};
```

### 4. Add Transfer Handler
```javascript
const onSubmitTransferWorkplaces = async () => {
  try {
    const response = await fetch(
      `${config.GENERAL_AUTH_URL}/staffio/api/v2/workplaces:bulk-update`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          workplaceIds: selectedWorkplaces,
          organizationalUnitId: destinationUnitId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Transfer failed");
    }

    toast.success(`${selectedWorkplaces.length} workplaces transferred!`);
    setTransferModal(false);
    queryClient.invalidateQueries(KEYS.organizationalUnits);
  } catch (error) {
    toast.error("Error transferring workplaces");
  }
};
```

### 5. Use in WorkplaceEmployeeSection
```javascript
<WorkplaceEmployeeSection
  workplace={workplaces}
  levelColor="#1E5EFF"
  selectedWorkplaces={selectedWorkplaces}
  onToggleWorkplace={(id) => {
    setSourceUnitId(unitId);
    onToggleWorkplaceSelection(id);
  }}
/>
```

### 6. Render Modal
```javascript
{transferModal && (
  <TransferWorkplacesModal
    open={transferModal}
    onClose={() => setTransferModal(false)}
    onSubmit={onSubmitTransferWorkplaces}
    selectedWorkplaces={selectedWorkplaces}
    sourceUnitName={getSourceUnitName()}
    destinationUnitId={destinationUnitId}
    onDestinationChange={setDestinationUnitId}
    allUnits={collectAllUnits(orgUnits)}
    sourceUnitId={sourceUnitId}
  />
)}
```

---

## Component API Reference

### TransferWorkplacesModal Props

```typescript
interface TransferWorkplacesModalProps {
  open: boolean;                           // Modal visibility
  onClose: () => void;                    // Close handler
  onSubmit: () => void;                   // Submit handler
  selectedWorkplaces: string[];           // Workplace IDs to transfer
  sourceUnitName: string;                 // Name of source unit
  destinationUnitId?: string;             // Selected destination ID
  onDestinationChange: (id: string) => void;  // Destination change handler
  allUnits: OrgUnit[];                    // All available org units
  sourceUnitId: string;                   // Source org unit ID
  isLoading?: boolean;                    // Loading state (optional)
}
```

### WorkplaceEmployeeSection Props

```typescript
interface WorkplaceEmployeeSectionProps {
  workplace: Workplace[];                 // Workplace objects
  levelColor: string;                     // Hex color code
  selectedWorkplaces: string[];           // Currently selected IDs
  onToggleWorkplace?: (id: string) => void; // Toggle handler (optional)
}
```

---

## Key Functions

### collectAllUnits()
Flattens the hierarchical org unit structure into a flat array.

```javascript
const allUnits = collectAllUnits(get(level1List, "data", []));
// Use for dropdown options
```

### getSourceUnitName()
Retrieves the name of the source organizational unit.

```javascript
const sourceName = getSourceUnitName();
// Returns: "Department Name"
```

### onToggleWorkplaceSelection()
Adds or removes a workplace from selection.

```javascript
onToggleWorkplaceSelection("workplace-uuid");
// Toggles selection state
```

---

## Common Patterns

### Pattern 1: Multi-Level Selection
```javascript
// User can select from any level
<WorkplaceEmployeeSection
  onToggleWorkplace={(id) => {
    setSourceUnitId(level1.id);  // Track source at any level
    onToggleWorkplaceSelection(id);
  }}
/>
```

### Pattern 2: Reset on Cancel
```javascript
const handleCancel = () => {
  setSelectedWorkplaces([]);
  setSourceUnitId(null);
  setDestinationUnitId(null);
  setTransferModal(false);
};
```

### Pattern 3: Validation Before Transfer
```javascript
const canTransfer = 
  selectedWorkplaces.length > 0 && 
  destinationUnitId && 
  sourceUnitId !== destinationUnitId;
```

---

## State Management Flow

```
┌─────────────────────────────────────────┐
│ User checks workplaces                  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ onToggleWorkplaceSelection() triggered  │
│ - Add/remove from selectedWorkplaces    │
│ - Set sourceUnitId                      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Selection bar appears at top            │
│ - Shows count                           │
│ - Shows source unit                     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ User clicks "Transfer"                  │
│ - Modal opens with destination select   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ User selects destination                │
│ - setDestinationUnitId() called         │
│ - Preview updates                       │
│ - Submit button enabled                 │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ User clicks "Transfer" in modal         │
│ - API call sent                         │
│ - Loading state shown                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Transfer complete                       │
│ - Modal closes                          │
│ - Toast notification                    │
│ - UI refreshes                          │
│ - State reset                           │
└─────────────────────────────────────────┘
```

---

## Error Handling

### API Error Handling
```javascript
try {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new Error("Transfer failed");
  }
  // Success
} catch (error) {
  toast.error("Error message");
  console.error(error);
}
```

### Validation Errors
```javascript
if (!destinationUnitId) {
  toast.error("Please select a destination");
  return;
}

if (selectedWorkplaces.length === 0) {
  toast.error("Please select workplaces");
  return;
}
```

---

## Styling & Theming

### Using useAppTheme Hook
```javascript
const { bg, isDark, border, text } = useAppTheme();

// Apply theme-aware styles
style={{
  backgroundColor: bg("#ffffff", "#1e1e1e"),
  borderColor: border("#e5e7eb", "#333333"),
  color: text("#1f2937", "#ffffff"),
}}
```

### Color Palette
```javascript
const LEVEL_COLORS = {
  1: { bg: "#ECF2FF", color: "#1E5EFF" },    // Blue
  2: { bg: "#FFF4C9", color: "#FFC700" },    // Yellow
  3: { bg: "#C4F8E2", color: "#1FD286" },    // Green
  4: { bg: "#FFE8D6", color: "#FF9600" },    // Orange
  5: { bg: "#FFD9D9", color: "#FF4D4D" },    // Red
};
```

---

## Animation Configuration

### Framer Motion
```javascript
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Pulsing Indicator
```javascript
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  Indicator
</motion.div>
```

---

## Testing Checklist

- [ ] Checkbox selection works
- [ ] Counter updates correctly
- [ ] Status bar appears/disappears
- [ ] Modal opens and closes
- [ ] Destination dropdown populates
- [ ] Preview updates on selection
- [ ] API call sends correct payload
- [ ] Success notification appears
- [ ] UI refreshes after transfer
- [ ] Dark mode looks good
- [ ] Mobile layout is responsive
- [ ] Keyboard navigation works
- [ ] No console errors

---

## Performance Tips

1. **Memoize collections**: Use `useMemo` for flattened units
2. **Debounce selections**: Avoid rapid state updates
3. **Lazy load modals**: Load modal only when needed
4. **Optimize re-renders**: Use `React.memo` for WorkplaceEmployeeSection
5. **Cache queries**: Use React Query properly

---

## Accessibility

- ✅ Semantic HTML (Dialog, Button, Checkbox)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Color contrast compliance
- ✅ Focus management
- ✅ Toast notifications for feedback

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ | Full support |
| Firefox | ✅ | Full support |
| Safari | ✅ | Full support |
| Edge | ✅ | Full support |
| IE11 | ❌ | Not supported |

---

## Troubleshooting

### Issue: Checkboxes not appearing
**Solution**: Verify `onToggleWorkplace` prop is passed to component

### Issue: Modal not opening
**Solution**: Check `transferModal` state and `open` prop value

### Issue: Selection not persisting
**Solution**: Verify state management in parent component

### Issue: API call failing
**Solution**: Check token validity and endpoint URL

---

## Resources

- 📖 Full Documentation: `WORKPLACE_TRANSFER_FEATURE.md`
- 📋 Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
- 🎨 Material-UI Docs: https://mui.com/
- ✨ Framer Motion: https://www.framer.com/motion/
- ⚛️ React Hooks: https://react.dev/reference/react

---

**Last Updated**: April 1, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
