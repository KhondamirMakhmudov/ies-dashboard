# Workplace Transfer Feature - Implementation Guide

## Overview
A complete UI/UX solution for moving workplaces between organizational units in the org unit management system. Users can now easily select multiple workplaces from one organizational unit and transfer them to another with a smooth, intuitive interface.

## Features Implemented

### 1. **Workplace Selection with Checkboxes**
- ✅ Added checkboxes to each workplace card in the hierarchy
- ✅ Visual feedback with background color change when workplace is selected
- ✅ Real-time counter of selected workplaces
- ✅ One-click selection/deselection
- **File**: [src/components/card/workPlaceOrgUnit.jsx](src/components/card/workPlaceOrgUnit.jsx)

### 2. **Improved Selection Bar**
- ✅ Prominent, animated selection status bar at the top
- ✅ Shows source organizational unit
- ✅ Displays count of selected workplaces
- ✅ Color-coded buttons: Green for "Transfer", Gray for "Cancel"
- ✅ Pulsing indicator dot to draw attention
- ✅ Responsive layout (desktop and mobile friendly)
- **Location**: Top of management-organizations page

### 3. **Enhanced Transfer Modal**
- ✅ Beautiful, modern dialog design
- ✅ Source information section (blue themed)
- ✅ Destination selection dropdown with preview
- ✅ Real-time destination preview (green themed)
- ✅ Warning message about action permanence
- ✅ Disabled submit button until destination is selected
- ✅ Smooth animations and transitions
- **File**: [src/components/modal/transfer-workplaces-modal.jsx](src/components/modal/transfer-workplaces-modal.jsx)

### 4. **API Integration**
- ✅ Connected to the backend endpoint: `/staffio/api/v2/workplaces:bulk-update`
- ✅ Sends correct payload: `workplaceIds`, `organizationalUnitId`
- ✅ Success/error toast notifications
- ✅ Automatic UI refresh after successful transfer
- **Location**: [src/pages/dashboard/structure-organizations/management-organizations/index.js](src/pages/dashboard/structure-organizations/management-organizations/index.js) (line ~300)

## How to Use (User Guide)

### Step 1: Select Workplaces
1. Navigate to the org unit management page
2. Expand any organizational unit to view workplaces
3. Click the checkbox on the right side of any workplace card to select it
4. Repeat for multiple workplaces (even across different organizational units)
5. A selection counter appears showing number of selected workplaces

### Step 2: See Selection Status
- A prominent blue bar appears at the top showing:
  - Source organizational unit name
  - Total number of selected workplaces
  - Green "Transfer" button
  - Gray "Cancel" button

### Step 3: Open Transfer Modal
1. Click the green "Transfer" button in the selection bar
2. A modal dialog opens with:
   - Source unit information
   - Destination unit selection dropdown
   - Preview of selected destination
   - Warning about the action

### Step 4: Select Destination & Transfer
1. Choose the destination organizational unit from the dropdown
2. Review the selection preview
3. Click the green "Transfer" button to confirm
4. Success notification appears
5. UI automatically refreshes with updated hierarchy

### Step 5: Cancel (Optional)
- Click "Cancel" button at any time to deselect all workplaces
- Or click the "Cancel" button in the modal dialog

## Technical Details

### Files Modified
1. **[src/components/card/workPlaceOrgUnit.jsx](src/components/card/workPlaceOrgUnit.jsx)**
   - Added checkbox rendering with selection styling
   - Added conditional styling based on selection state
   - Position: Absolute positioned in top-right of workplace card

2. **[src/pages/dashboard/structure-organizations/management-organizations/index.js](src/pages/dashboard/structure-organizations/management-organizations/index.js)**
   - Imported new `TransferWorkplacesModal` component
   - Replaced old `MethodModal` with new component
   - Enhanced selection bar UI with animations
   - Updated useAppTheme hook to include `text` property
   - Added `getSourceUnitName()` helper function

### Files Created
1. **[src/components/modal/transfer-workplaces-modal.jsx](src/components/modal/transfer-workplaces-modal.jsx)**
   - New dedicated modal component for workplace transfers
   - Features:
     - Material-UI Dialog based
     - Theme-aware styling (light/dark mode)
     - Animated entrance/exit
     - Source and destination preview sections
     - Warning alert box
     - Responsive design

## Component Props Reference

### TransferWorkplacesModal
```javascript
<TransferWorkplacesModal
  open={boolean}                           // Modal visibility
  onClose={() => {}}                       // Close handler
  onSubmit={() => {}}                      // Submit handler
  selectedWorkplaces={[string]}            // Array of workplace IDs
  sourceUnitName={string}                  // Name of source org unit
  destinationUnitId={string}               // Selected destination ID
  onDestinationChange={(id) => {}}         // Destination change handler
  allUnits={array}                         // All available org units
  sourceUnitId={string}                    // Source org unit ID
  isLoading={boolean}                      // Loading state
/>
```

### WorkplaceEmployeeSection (Updated)
```javascript
<WorkplaceEmployeeSection
  workplace={array}                        // Workplace objects
  levelColor={string}                      // Hex color for this level
  selectedWorkplaces={[string]}            // Currently selected IDs
  onToggleWorkplace={(id) => {}}           // Checkbox toggle handler
/>
```

## API Endpoint
**Endpoint**: `PATCH https://${config.GENERAL_AUTH_URL}/staffio/api/v2/workplaces:bulk-update`

**Request Body**:
```json
{
  "workplaceIds": ["uuid-1", "uuid-2", "uuid-3"],
  "organizationalUnitId": "destination-uuid"
}
```

**Success Response**: 
- Toast: "X рабочих мест успешно перемещено"
- Auto-refresh of organizational unit tree

**Error Response**:
- Toast: "Ошибка при перемещении рабочих мест"

## Color Coding System
The app uses a hierarchical color system:
- **Level 1 (Blue)**: #1E5EFF - Main departments
- **Level 2 (Yellow)**: #FFC700 - Sub-departments
- **Level 3 (Green)**: #1FD286 - Teams
- **Level 4 (Orange)**: #FF9600 - Groups
- **Level 5 (Red)**: #FF4D4D - Sub-groups

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance Considerations
- Checkbox selection is instant (no API calls)
- Modal opens with smooth animation (300ms)
- Transfer API call includes loading state
- UI refreshes only when needed
- No unnecessary re-renders

## Future Enhancements (Optional)
1. **Drag & Drop**: Advanced users can drag workplaces between units
2. **Batch Operations**: Transfer multiple groups at once
3. **Undo Feature**: Revert last transfer
4. **Transfer History**: Log of all transfers with timestamps
5. **Bulk Import**: Import workplaces from CSV

## Troubleshooting

### Checkboxes not appearing
- Ensure `onToggleWorkplace` prop is passed to `WorkplaceEmployeeSection`
- Check that workplace cards are expanded

### Transfer modal not showing
- Verify `TransferWorkplacesModal` is imported correctly
- Check that `allUnits` prop includes all organizational units

### API errors
- Verify bearer token is valid
- Check that destination unit ID is not the same as source
- Ensure workplaceIds are valid UUIDs

## Support
For issues or questions about this feature, please refer to the component documentation in the respective files.
