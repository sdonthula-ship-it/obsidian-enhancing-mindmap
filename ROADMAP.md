# Mind Map Plugin Roadmap
## From Current State to Frictionless Spatial Thinking Workspace

---

## Vision Recap

Transform this plugin from a traditional hierarchical mind map into a **frictionless spatial thinking workspace** that enables:
- Instant thought capture
- Organic knowledge connections
- Spatial thinking over rigid hierarchy
- Flow state preservation
- Many-to-many relationships

---

## Current State Assessment

### ✅ What We Have:
- Traditional tree-based mind map
- Basic node creation/editing
- Drag-and-drop positioning
- Floating nodes (recent)
- Instant capture (new)
- Multi-select (new)
- Good keyboard shortcuts (new)
- Visual clarity improvements (new)

### ❌ What We're Missing:
- Many-to-many relationships (critical gap)
- Bidirectional linking
- Non-hierarchical connections
- Semantic clustering
- Advanced search
- Performance optimizations for scale
- Lasso selection
- Auto-layout options

### 🔴 Critical Architecture Limitation:
**The current data structure is a tree** - each node has exactly one parent. To achieve the vision, we need a **graph structure** where nodes can have multiple connections.

---

## Phased Roadmap

### Phase 1: Foundation (Weeks 1-3) - CRITICAL PATH

**Goal:** Enable non-hierarchical thinking while maintaining backward compatibility

#### 1.1 Data Model Refactor (Week 1)
**Priority: CRITICAL - Blocks everything else**

**Current:**
```typescript
interface INode {
  parent: INode;      // Single parent only
  children: INode[];  // Tree structure
}
```

**Target:**
```typescript
interface INode {
  id: string;
  connections: Connection[];  // Many-to-many
  position: {x: number, y: number};
  // Keep children for legacy compatibility
}

interface Connection {
  sourceId: string;
  targetId: string;
  type: 'parent-child' | 'reference' | 'related' | 'custom';
  label?: string;
  bidirectional: boolean;
}
```

**Implementation approach:**
- Add new data structures alongside existing tree
- Maintain backward compatibility
- Migrate existing edges to connections
- Update serialization/deserialization

**Estimated effort:** 3-5 days
**Risk:** High - touches core architecture

---

#### 1.2 Visual Connection Creation (Week 2)
**Priority: HIGH - Core UX improvement**

**Features:**
- Drag from node edge to create connection
- Connection preview while dragging
- Click existing connection to edit/delete
- Reconnect connections by dragging endpoints

**UX flow:**
1. Click and hold on node edge/border
2. Drag to target node
3. Release to create connection
4. Modal appears for connection type (optional)

**Technical:**
- Add connection handle anchors to nodes
- Implement drag preview with SVG
- Update Layout.ts to draw non-hierarchical edges
- Add connection editing UI

**Estimated effort:** 4-6 days
**Dependencies:** Data model refactor

---

#### 1.3 Keyboard Connection Mode (Week 3)
**Priority: MEDIUM - Power user feature**

**Shortcut:** `Ctrl/Cmd + L` (for "Link")

**Flow:**
1. Select source node
2. Press `Ctrl/Cmd + L`
3. Fuzzy search/select target node
4. Connection created

**Features:**
- Quick search modal
- Recent nodes suggestion
- Nearby nodes prioritized
- Type as you search

**Technical:**
- Create search modal component
- Implement fuzzy matching
- Add to command palette
- Cache node positions for "nearby" calculation

**Estimated effort:** 2-3 days

---

### Phase 2: Enhanced Interaction (Weeks 4-6)

#### 2.1 Lasso Selection (Week 4)
**Priority: HIGH - Frequently requested**

**Behavior:**
- Click and drag on empty canvas
- Draw selection rectangle
- All nodes within rectangle selected
- Works with Shift for additive selection

**Technical:**
- Detect drag on non-node area
- Render selection rectangle with SVG/div overlay
- Bounding box collision detection
- Integrate with existing multi-select

**Estimated effort:** 2-3 days

---

#### 2.2 Bulk Operations (Week 4-5)
**Priority: MEDIUM - Logical extension of multi-select**

**Operations:**
- Move all selected nodes together
- Delete multiple nodes
- Apply style to selection
- Group into cluster
- Export selection

**UI:**
- Context menu on selection
- Command palette entries
- Keyboard shortcuts

**Technical:**
- Iterate over `selectedNodes` array
- Execute operation on each
- Single undo entry for bulk operation

**Estimated effort:** 3-4 days

---

#### 2.3 Smart Zoom & Pan (Week 5-6)
**Priority: MEDIUM - UX polish**

**Features:**
- Smooth zoom with trackpad
- Zoom to fit all nodes
- Zoom to fit selection
- Focus mode (dim unrelated nodes)
- Minimap for navigation

**Technical:**
- Implement viewport culling
- Add zoom level controls
- Create minimap component
- Add focus mode toggle

**Estimated effort:** 4-5 days

---

### Phase 3: Intelligence & Organization (Weeks 7-10)

#### 3.1 Relationship Types (Week 7)
**Priority: MEDIUM - Adds semantic meaning**

**Built-in types:**
- Causes
- Contradicts
- Supports
- Depends on
- Similar to
- Custom

**Features:**
- Connection labeling
- Visual styling per type
- Filter by relationship type
- Legend/key

**Technical:**
- Add type to Connection interface
- Update rendering for different types
- Create type selector UI
- Add filtering logic

**Estimated effort:** 3-4 days

---

#### 3.2 Semantic Clustering (Week 8-9)
**Priority: LOW - Nice to have, complex**

**Features:**
- Auto-suggest related nodes
- Identify node clusters
- Suggest connections
- Find isolated ideas

**Approaches:**
1. **Simple:** Text similarity (TF-IDF, cosine similarity)
2. **Advanced:** Embeddings with local model
3. **Future:** LLM integration

**MVP approach:** Text similarity only

**Technical:**
- Extract text content
- Compute similarity scores
- Suggest connections above threshold
- UI for accepting/rejecting suggestions

**Estimated effort:** 5-7 days
**Note:** Start with simple approach

---

#### 3.3 Search & Filter (Week 10)
**Priority: HIGH - Essential for large maps**

**Features:**
- Full-text search across nodes
- Filter by tags
- Filter by relationship type
- Filter by date created/modified
- Highlight matching nodes
- Navigate between results

**Technical:**
- Build search index
- Implement highlighting
- Add search panel UI
- Keyboard navigation (Ctrl/Cmd + F)

**Estimated effort:** 4-5 days

---

### Phase 4: Performance & Scale (Weeks 11-12)

#### 4.1 Viewport Culling (Week 11)
**Priority: HIGH - Needed for 1000+ nodes**

**Goal:** Only render nodes visible in viewport

**Approach:**
- Calculate viewport bounding box
- Only render/update visible nodes
- Use placeholder for culled nodes
- Update on pan/zoom

**Technical:**
- Implement in layout/refresh cycle
- Add visibility calculation
- Test with large datasets
- Profile performance improvements

**Estimated effort:** 3-4 days

---

#### 4.2 Virtual Rendering (Week 12)
**Priority: MEDIUM - For extreme scale**

**Goal:** Handle 10,000+ nodes

**Approach:**
- Canvas/WebGL rendering instead of DOM
- Level-of-detail (LOD) based on zoom
- Batch rendering updates
- Lazy edge drawing

**Technical:**
- Evaluate PixiJS vs native Canvas
- Rewrite rendering layer
- Maintain feature parity
- Progressive enhancement

**Estimated effort:** 7-10 days
**Risk:** High - major refactor

---

### Phase 5: Polish & Extras (Weeks 13+)

#### 5.1 Auto-Layout Algorithms
**Priority: LOW - Optional feature**

**Layouts:**
- Force-directed
- Hierarchical
- Radial
- Organic

**Features:**
- Layout selector
- Preserve manual positions
- Animate transitions
- Apply to selection only

---

#### 5.2 Timeline & History
**Priority: LOW - Power user feature**

**Features:**
- View thought evolution
- Replay mind map creation
- Branch explorations
- Restore previous states

---

#### 5.3 Advanced Export
**Priority: LOW - Nice to have**

**Formats:**
- PDF
- SVG
- PNG (high-res)
- Markdown with links
- JSON for API

---

## Technical Debt & Improvements

### Continuous Tasks:

#### Code Quality:
- [ ] Add comprehensive TypeScript types
- [ ] Remove console.log statements
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Document public APIs

#### Performance:
- [ ] Profile layout algorithm
- [ ] Optimize refresh cycles
- [ ] Reduce unnecessary re-renders
- [ ] Implement dirty checking

#### Accessibility:
- [ ] Full keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Keyboard shortcuts help panel

---

## Success Metrics

### Phase 1 Success:
- [ ] Users can create non-hierarchical connections
- [ ] No performance regression
- [ ] Backward compatible with existing maps
- [ ] Zero data loss

### Phase 2 Success:
- [ ] Lasso selection feels natural
- [ ] Bulk operations save time
- [ ] Zoom/pan is smooth
- [ ] Users stay in flow state longer

### Phase 3 Success:
- [ ] Users discover unexpected connections
- [ ] Search finds relevant nodes
- [ ] Relationship types add clarity

### Phase 4 Success:
- [ ] 1000+ node maps remain responsive
- [ ] 60 FPS maintained during pan/zoom
- [ ] Initial load under 2 seconds

---

## Resource Requirements

### Development Time Estimate:
- **Phase 1 (Critical):** 3 weeks (120 hours)
- **Phase 2 (High value):** 3 weeks (120 hours)
- **Phase 3 (Intelligence):** 4 weeks (160 hours)
- **Phase 4 (Performance):** 2 weeks (80 hours)
- **Phase 5 (Polish):** Ongoing

**Total MVP (Phases 1-2):** ~6 weeks of focused development

### Skills Needed:
- TypeScript/JavaScript
- SVG/Canvas rendering
- Data structures (graphs)
- React (for modals/UI)
- Performance optimization

---

## Risks & Mitigation

### Risk 1: Data Model Breaking Change
**Impact:** High - could break existing maps
**Mitigation:**
- Maintain backward compatibility layer
- Implement migration logic
- Add version to data format
- Extensive testing before release

### Risk 2: Performance with Large Graphs
**Impact:** Medium - user frustration
**Mitigation:**
- Implement viewport culling early
- Set hard limits initially (e.g., 500 nodes)
- Profile continuously
- Consider WebGL if needed

### Risk 3: Complex Connections UI
**Impact:** Medium - confusing UX
**Mitigation:**
- User testing at each phase
- Provide examples/templates
- Progressive disclosure
- Keep hierarchical mode as default

### Risk 4: Scope Creep
**Impact:** High - never finish
**Mitigation:**
- Strict phase gates
- MVP first approach
- User feedback between phases
- Feature flags for experiments

---

## Next Immediate Actions

### This Week:
1. **Review Phase 1.1 design** - Data model refactor
2. **Create proof of concept** - Many-to-many connections
3. **User testing plan** - How to validate Phase 1
4. **Set up feature flags** - For gradual rollout

### This Month:
1. Complete Phase 1.1 (data model)
2. Start Phase 1.2 (visual connections)
3. User feedback session
4. Adjust roadmap based on feedback

---

## Open Questions

1. **Should we support cyclic connections?** (probably yes)
2. **How to serialize many-to-many to markdown?** (custom format needed)
3. **Compatibility with Obsidian Canvas?** (explore integration)
4. **Mobile experience?** (touch gestures, simplified UI)
5. **Collaboration support?** (future consideration)

---

## Community Engagement

### Share roadmap with:
- GitHub discussions
- Obsidian forum
- User survey for priorities

### Gather feedback on:
- Most wanted features
- Pain points with current version
- Willingness to beta test
- Use cases we haven't considered

---

## Conclusion

This roadmap transforms the plugin from a traditional mind map into a **spatial thinking workspace** while:
- Maintaining backward compatibility
- Delivering value incrementally
- Managing technical risk
- Staying focused on core vision

**Priority:** Execute Phase 1 (Weeks 1-3) to unlock non-hierarchical thinking. Everything else builds on this foundation.
