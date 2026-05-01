# Connection Type Selector Modal

## ✅ Implemented: Phase 1.2 Feature #1

The plugin now includes a **connection type selector modal** that allows users to choose connection types, add labels, and create bidirectional connections when linking nodes.

## What Changed

### New Modal Interface
When creating a connection between nodes, a modal dialog now appears with:
- **Connection type dropdown** - 9 connection types to choose from
- **Label input** - Optional text to describe the connection
- **Bidirectional toggle** - Create two-way connections

### User Experience
1. Select source node (click on it)
2. Press `Ctrl+L` (or `Cmd+L` on Mac)
3. Click on target node
4. **NEW**: Modal appears asking for connection details
5. Select type, add label (optional), toggle bidirectional
6. Click "Create Connection"
7. Connection appears with chosen styling

## Connection Types Available

| Type | Description | Visual Style | Use Case |
|------|-------------|--------------|----------|
| **Reference** | Link to related idea | Blue dashed line | Cross-references, citations |
| **Related** | Similar concept | Purple dashed line | Associated ideas, themes |
| **Causes** | Causal relationship | Red solid line | Cause-effect, leads to |
| **Contradicts** | Opposing idea | Dark red solid line | Conflicts, opposing views |
| **Supports** | Supporting evidence | Green solid line | Evidence, backing, reinforcement |
| **Depends On** | Dependency | Orange solid line | Prerequisites, requirements |
| **Similar To** | Analogous | Teal solid line | Analogies, comparisons |
| **Custom** | User-defined | Gray solid line | Any other relationship |

## Features

### Connection Type Selection
Choose the semantic meaning of your connection from 8 predefined types plus a custom type.

### Labels
Add descriptive text to connections to clarify the relationship:
- "leads to"
- "inspired by"
- "contradicts because"
- "depends on for X"

### Bidirectional Connections
Toggle to create two-way connections that appear as connections from both nodes:
- Useful for symmetric relationships
- Both nodes show the connection in their data
- Only one visual line is drawn (no duplicate lines)

## How to Use

### Creating Typed Connections

**1. Basic workflow:**
```
1. Click on source node
2. Press Ctrl+L (Cmd+L on Mac)
3. Click on target node
4. Modal appears
5. Select connection type from dropdown
6. Click "Create Connection"
```

**2. With label:**
```
1-4. (same as above)
5. Select connection type
6. Type label in text field (e.g., "because")
7. Click "Create Connection"
```

**3. Bidirectional:**
```
1-4. (same as above)
5. Select connection type
6. Toggle "Bidirectional" on
7. Click "Create Connection"
```

### Examples

**Cause-effect relationship:**
- Type: "Causes"
- Label: "leads to increased revenue"
- Bidirectional: off

**Mutual support:**
- Type: "Supports"
- Label: "mutually reinforcing"
- Bidirectional: on

**Dependency:**
- Type: "Depends On"
- Label: "requires completion of"
- Bidirectional: off

**Reference link:**
- Type: "Reference"
- Label: "see also"
- Bidirectional: off

## Technical Details

### Modal Implementation
- **File**: `src/modals.ts` - `ConnectionTypeModal` class
- **Integration**: Called from `mindmap.ts` in `handleConnectionModeClick()`
- **Requires**: Obsidian app instance passed to MindMap constructor

### Data Structure
Connections now include:
```typescript
{
    id: string;
    sourceId: string;
    targetId: string;
    type: ConnectionType;      // Selected from modal
    label?: string;            // Optional label from modal
    bidirectional?: boolean;   // Toggle from modal
    metadata?: Record<string, any>;
}
```

### Success Notification
After creating a connection, a notice appears showing:
- Connection type
- Label (if provided)
- Bidirectional status (if enabled)

Example: `Connection created: causes ("leads to increased revenue") (bidirectional)`

### Backward Compatibility
- If modal cannot be shown (no app instance), falls back to default "reference" type
- Existing connections without types still work
- Old code using `createConnection()` directly still works

## What's Different from Before

### Before (Phase 1.1)
- All connections created as "reference" type
- No way to choose connection type
- No labels
- No bidirectional option
- Direct connection creation

### After (Phase 1.2)
- ✅ Modal asks for connection type
- ✅ 9 connection types available
- ✅ Optional labels
- ✅ Bidirectional toggle
- ✅ Better user feedback

## Testing Instructions

1. **Reload Obsidian**: Press `Cmd+R` (or `Ctrl+R`)

2. **Test basic typed connection**:
   - Create two nodes
   - Select first node
   - Press `Ctrl+L`
   - Click second node
   - Modal should appear
   - Select "Causes" from dropdown
   - Click "Create Connection"
   - Red solid line should appear

3. **Test with label**:
   - Select a node
   - Press `Ctrl+L`
   - Click another node
   - Select "Supports"
   - Type "because X" in label field
   - Click "Create Connection"
   - Green line should appear with label

4. **Test bidirectional**:
   - Select a node
   - Press `Ctrl+L`
   - Click another node
   - Select "Related"
   - Toggle "Bidirectional" ON
   - Click "Create Connection"
   - Check both nodes' data has connections

5. **Test different types**:
   - Create connections with each type
   - Verify colors match:
     - Reference: blue dashed
     - Related: purple dashed
     - Causes: red solid
     - Contradicts: dark red solid
     - Supports: green solid
     - Depends On: orange solid
     - Similar To: teal solid
     - Custom: gray solid

## Pending Phase 1.2 Features

Still to be implemented:
- **Visual drag-from-edge creation** - Drag from node edge instead of Ctrl+L
- **Connection editing UI** - Right-click to edit existing connections
- **Reconnect endpoints** - Drag connection ends to change source/target
- **Connection preview** - See line while dragging

## Known Issues

None currently! This is a fresh implementation.

## Troubleshooting

**Modal doesn't appear:**
- Check if Obsidian app instance is available
- Should fall back to "reference" type with console warning

**Wrong connection type:**
- Delete connection and recreate
- Connection editing UI coming in future update

**Label not showing:**
- Labels render at connection midpoint
- May be obscured by nodes if they're close together
- Move nodes apart to see label

---

**Status:** ✅ Fully implemented and deployed
**Phase:** 1.2 (partial - feature #1 of 6)
**Next:** Visual drag-from-edge creation (feature #2)
**Build:** ✅ Successful
**Deployment:** ✅ Complete
