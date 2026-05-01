# Many-to-Many Connections - Graph Structure Support

## ✅ Implemented: Phase 1.1 from Roadmap

The plugin now supports **many-to-many connections** between nodes, transforming it from a pure tree structure to a graph structure!

## What Changed

### Data Model
- **Added `IConnection` interface** - represents connections between nodes
- **Added `ConnectionType` enum** - 9 types of relationships
- **Extended `INodeData`** - now includes optional `connections` array
- **Backward compatible** - existing tree structure (parent/children) still works

### Connection Types
```typescript
enum ConnectionType {
    PARENT_CHILD = 'parent-child',
    REFERENCE = 'reference',
    RELATED = 'related',
    CAUSES = 'causes',
    CONTRADICTS = 'contradicts',
    SUPPORTS = 'supports',
    DEPENDS_ON = 'depends-on',
    SIMILAR_TO = 'similar-to',
    CUSTOM = 'custom'
}
```

## How to Use

### Creating Connections

**Method 1: Keyboard Shortcut (Recommended)**
1. Select a source node (click on it)
2. Press `Ctrl+L` (or `Cmd+L` on Mac)
3. Cursor changes to crosshair
4. Click on target node to create connection
5. Connection appears as a line between nodes

**Method 2: Command Palette**
1. Select source node
2. Open command palette (`Ctrl+P` or `Cmd+P`)
3. Type "Create connection from selected node"
4. Click target node

### Canceling Connection Mode
- Press `Escape` to exit connection mode without creating a connection

### Visual Feedback
- **Source node**: Dashed border with pulsing glow
- **Cursor**: Changes to crosshair in connection mode
- **Notice**: "Click target node to create connection. Press ESC to cancel."

### Connection Lines
- **Reference connections**: Blue dashed lines (#4a9eff)
- **Related connections**: Purple dashed lines (#9b59b6)
- **Causes**: Red solid lines (#e74c3c)
- **Contradicts**: Dark red solid lines (#c0392b)
- **Supports**: Green solid lines (#27ae60)
- **Depends-on**: Orange solid lines (#f39c12)
- **Similar-to**: Teal solid lines (#16a085)
- **Custom**: Gray solid lines (#95a5a6)

### Deleting Connections
- Click on any connection line
- Confirm deletion in prompt

## API for Developers

### Node Methods (in INode.ts)

```typescript
// Add connection
node.addConnection(targetNodeId, ConnectionType.REFERENCE, 'label', false);

// Remove connection by ID
node.removeConnection(connectionId);

// Remove all connections to a specific node
node.removeConnectionsTo(targetNodeId);

// Get all connections
const connections = node.getConnections();

// Get connections by type
const references = node.getConnectionsByType(ConnectionType.REFERENCE);

// Check if connected
if (node.isConnectedTo(targetNodeId)) { /* ... */ }

// Get connection to specific node
const conn = node.getConnectionTo(targetNodeId);

// Update connection
node.setConnectionLabel(connectionId, 'New Label');
node.setConnectionType(connectionId, ConnectionType.CAUSES);

// Clear all connections
node.clearConnections();
```

### MindMap Methods (in mindmap.ts)

```typescript
// Find node by ID
const node = mindmap.findNodeById(nodeId);

// Create connection programmatically
mindmap.createConnection(
    sourceId,
    targetId,
    ConnectionType.REFERENCE,
    'optional label',
    false  // bidirectional
);

// Remove connection
mindmap.removeConnection(connectionId);

// Remove all connections between two nodes
mindmap.removeConnectionsBetween(nodeId1, nodeId2);

// Enter connection mode
mindmap.startConnectionMode(sourceNode);

// Exit connection mode
mindmap.exitConnectionMode();

// Render all connections (called automatically)
mindmap.renderConnections();
```

## Technical Details

### Rendering
- **Two SVG layers**:
  1. `edgeGroup` - hierarchical tree connections (existing)
  2. `connectionGroup` - many-to-many graph connections (new)
- Connections render AFTER tree layout to appear on top
- Lines are clickable for editing/deletion
- Arrows indicate direction (unless bidirectional)

### Data Storage
```typescript
interface IConnection {
    id: string;                    // Unique ID
    sourceId: string;              // Source node ID
    targetId: string;              // Target node ID
    type: ConnectionType;          // Connection type
    label?: string;                // Optional label
    bidirectional?: boolean;       // Two-way connection
    metadata?: Record<string, any>; // Custom data
}
```

Connections are stored in the source node's `data.connections` array.

### Backward Compatibility
- Existing tree structure unchanged
- Nodes without connections work exactly as before
- Parent/child relationships still rendered via `edgeGroup`
- Graph connections rendered additively via `connectionGroup`

## Current Limitations

1. ~~**Default connection type**~~ - ✅ **RESOLVED** (see CONNECTION_TYPE_SELECTOR.md)
   - Modal now allows choosing connection type during creation

2. ~~**No connection labels yet**~~ - ✅ **RESOLVED** (see CONNECTION_TYPE_SELECTOR.md)
   - Modal includes optional label input field

3. ~~**No bidirectional toggle**~~ - ✅ **RESOLVED** (see CONNECTION_TYPE_SELECTOR.md)
   - Modal includes bidirectional toggle

4. **Click-only creation**: No drag-from-edge UI yet
   - Planned for Phase 1.2

5. **No connection editing UI**: Must delete and recreate to change type
   - Planned for Phase 1.2

## What's Next (Phase 1.2)

From the roadmap:
- ✅ **Connection type selector** - Modal when creating connection (**COMPLETED**)
- **Visual connection creation** - Drag from node edge to create connection
- **Connection preview** - See line while dragging
- **Connection editing** - Right-click to edit type/label
- **Reconnect endpoints** - Drag connection ends to change source/target

## Use Cases Now Possible

✅ **Reference links**: Connect related ideas across different branches
✅ **Causal relationships**: Show what causes what
✅ **Support/contradiction**: Map arguments and counter-arguments
✅ **Dependencies**: Show task dependencies
✅ **Semantic networks**: Build knowledge graphs
✅ **Cross-cutting concerns**: Connect orthogonal concepts

## Testing Instructions

1. **Reload Obsidian**: Press `Cmd+R` (or `Ctrl+R`)

2. **Create some nodes**:
   - Use `Ctrl/Cmd+Enter` to create 3-4 floating nodes
   - Spread them out on the canvas

3. **Create a connection**:
   - Click on first node (should show red border)
   - Press `Ctrl+L` (or `Cmd+L`)
   - Notice cursor becomes crosshair
   - Click on second node
   - Blue dashed line should appear!

4. **Test multiple connections**:
   - Select a node
   - Press `Ctrl+L`
   - Click on another node
   - Repeat from different nodes

5. **Delete a connection**:
   - Click on any connection line
   - Confirm deletion

6. **Cancel connection mode**:
   - Press `Ctrl+L` to enter mode
   - Press `Escape` to cancel

## Known Issues

None currently! This is a fresh implementation.

Report issues at: https://github.com/anthropics/obsidian-enhancing-mindmap/issues

---

**Status:** ✅ Fully implemented and ready for testing
**Build:** ✅ Successful
**Deployment:** ✅ Complete
**Next:** Test and provide feedback!
