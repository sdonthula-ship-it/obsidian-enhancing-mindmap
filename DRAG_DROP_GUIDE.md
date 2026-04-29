# Drag & Drop Guide

## 🎯 How to Rearrange Your Mindmap

The plugin supports **drag-and-drop** for reorganizing your mindmap structure!

## ⚠️ IMPORTANT: Select-Then-Drag Workflow

**You MUST select a node before you can drag it:**

```
1. CLICK node → Node gets selected (red border)
2. DRAG selected node → Move/reparent it
```

This is intentional design to:
- Prevent accidental drags
- Allow proper text selection when editing
- Follow standard UI patterns

## ✨ New Features

### Select-Then-Drag Pattern
- **IMPORTANT**: You must SELECT a node first before dragging it
- **Click** a node to select it (red border appears)
- **Grab cursor** (✋) appears on selected nodes
- **Grabbing cursor** (✊) appears while dragging

### Visual Feedback
- **Selection border** - Red/accent-colored border with glow when node is selected
- **"✋ Drag to move" tooltip** - Appears briefly when you select a node
- **Drag handle (⋮⋮)** - Appears on right side of selected nodes
- **Grab cursor (✋)** - Shows on selected nodes (draggable)
- **Semi-transparent dragged node** - Shows what you're moving
- **Animated drop target** - Dashed outline pulses on destination
- **Pulsing arrow indicator** - Shows exactly where node will be placed

## 📖 How to Use

### Moving Nodes (Reparenting)

To move "Gen AI vs ETL" to become a child of "Data Framework":

1. **Click** on "Gen AI vs ETL" to select it
   - Red/accent-colored border appears
   - "✋ Drag to move" tooltip shows briefly
   - Cursor changes to ✋ (grab)
   - Drag handle (⋮⋮) appears on right

2. **Click and drag** the selected node
   - Node becomes semi-transparent
   - Cursor changes to ✊ (grabbing)

3. **Drag** to "Data Framework"
   - Arrow indicator appears showing drop position
   - Target node gets pulsing outline

4. **Release** the mouse button
   - Node is reparented!
   - Structure updates automatically
   - Changes save to markdown

### Drop Zones

When dragging over a node, you can drop in different positions:

```
    ┌─────────────┐
    │   [  Top  ] │  ← Drop here: Add as sibling ABOVE
    │   Target    │
    │   [Bottom ] │  ← Drop here: Add as sibling BELOW
    └─────────────┘
         ↓  ↓
    Left   Right   ← Drop here: Add as child (left/right direction)
```

#### **Sibling Placement** (Top/Bottom)
- Drop on **top half** of a node → placed ABOVE as sibling
- Drop on **bottom half** of a node → placed BELOW as sibling

#### **Child Placement** (Left/Right)
- Drop on **right edge** → added as child on right branch
- Drop on **left edge** → added as child on left branch
- Drop on **center** → added as child (default direction)

### Copy Instead of Move

Hold **Ctrl** (or **Cmd** on Mac) while dragging to **copy** the node instead of moving it!

```
Drag         = Move node
Ctrl + Drag  = Copy node
```

## 🎨 Visual Indicators

### During Drag:

| Element | Visual | Meaning |
|---------|--------|---------|
| **Dragged Node** | Semi-transparent, scaled down | The node you're moving |
| **Drop Target** | Pulsing dashed outline | Where you're about to drop |
| **Arrow Indicator** | Pulsing colored triangle | Exact drop position & relationship |
| **Cursor** | Grabbing (✊) | You're actively dragging |

### Arrow Indicator Meanings:

- **⬆️ Up Arrow** - Will be placed as sibling ABOVE
- **⬇️ Down Arrow** - Will be placed as sibling BELOW
- **➡️ Right Arrow** - Will be added as child on RIGHT
- **⬅️ Left Arrow** - Will be added as child on LEFT

## 🔧 Get Help

Run the command **"Show drag & drop help"** from the command palette (Ctrl/Cmd+P) to see a quick reference!

## 💡 Tips

1. **Select first** - Click node to select it before dragging (red border appears)
2. **Look for ⋮⋮** - Drag handle appears on selected nodes
3. **Watch the arrow** - It shows exactly where the node will go
4. **Use drop zones** - Target specific areas for precise placement
5. **Hold Ctrl to copy** - Keep the original node in place
6. **Undo works** - Ctrl/Cmd+Z to undo any moves

## 📝 Example Workflow

### Move "Gen AI vs ETL" under "Data Framework":

1. **Click** "Gen AI vs ETL" → Red border + "✋ Drag to move" tooltip
2. See ✋ cursor and ⋮⋮ drag handle → Node is now draggable
3. **Click and drag** → Node becomes transparent, cursor shows ✊
4. Drag over "Data Framework" → See pulsing outline
5. Position over the RIGHT side → See ➡️ arrow
6. **Release mouse** → "Gen AI vs ETL" is now a child of "Data Framework"!

### Result:
```
Before:
Root
├─ Gen AI vs ETL
└─ Data Framework

After:
Root
└─ Data Framework
   └─ Gen AI vs ETL
```

## 🚀 Quick Reference

| Action | How To |
|--------|--------|
| **Select node** | Click on it (red border appears) |
| **Move node** | Select, then drag and drop |
| **Copy node** | Select, then Ctrl + Drag |
| **Add as sibling above** | Drag to top half of target |
| **Add as sibling below** | Drag to bottom half of target |
| **Add as child** | Drag to center/edges of target |
| **Undo move** | Ctrl/Cmd + Z |
| **Get help** | Command: "Show drag & drop help" |

## ✅ Benefits

- **Intuitive** - Works like you'd expect
- **Visual** - Clear feedback at every step
- **Precise** - Control exactly where nodes go
- **Flexible** - Move or copy with ease
- **Undoable** - Mistakes are easily reversible

Happy organizing! 🎉
