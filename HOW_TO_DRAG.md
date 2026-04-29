# 🎯 Quick Start: How to Drag & Drop Nodes

## The Problem You Encountered

You clicked on "Architecture" and saw it get a red border, but it wouldn't drag.

## Why It Happened

Nodes must be **selected first** before they become draggable. The red border meant it was selected, but you needed to drag from the selected node, not click-and-drag in one motion.

## ✅ Correct Workflow

### Step 1: SELECT the node
```
Click once on the node you want to move
↓
Red border appears → Node is now selected AND draggable
```

### Step 2: DRAG the selected node
```
Click and hold on the SAME node
↓
Drag it to another node
↓
Drop it → Node is reparented!
```

## 🎬 Complete Example

**Goal:** Move "Gen AI vs ETL" under "Data Framework"

1. **Click** "Gen AI vs ETL"
   - ✅ Red border appears
   - ✅ "✋ Drag to move" tooltip shows for 3 seconds
   - ✅ Grab cursor (✋) appears
   - ✅ Drag handle (⋮⋮) appears on right side

2. **Click and drag** on "Gen AI vs ETL"
   - ✅ Node becomes semi-transparent
   - ✅ Cursor shows grabbing hand (✊)

3. **Drag** over "Data Framework"
   - ✅ Arrow indicator shows where it will drop
   - ✅ Target gets pulsing outline

4. **Release** mouse button
   - ✅ "Gen AI vs ETL" is now child of "Data Framework"
   - ✅ Links update automatically
   - ✅ Saves to markdown

## 🔍 Visual Indicators to Look For

| Indicator | Means |
|-----------|-------|
| **Red border** | Node is selected |
| **✋ Grab cursor** | Node is draggable |
| **⋮⋮ On right side** | Drag handle (selected node) |
| **"✋ Drag to move"** | Tooltip confirming you can drag |
| **Semi-transparent** | Node is being dragged |
| **✊ Grabbing cursor** | Actively dragging |
| **Pulsing outline** | Valid drop target |
| **Arrow indicator** | Shows exact drop position |

## 💡 Pro Tips

1. **Don't rush** - Click to select, THEN drag
2. **Watch for red border** - That's your cue that it's draggable
3. **Look for ⋮⋮** - Drag handle on selected nodes
4. **Read the tooltip** - "✋ Drag to move" appears when ready
5. **Ctrl+Z works** - Undo any mistakes

## 🚀 Try It Now!

1. **Reload Obsidian** (Cmd+R)
2. **Click** any node → See red border
3. **Click and drag** that same node
4. Watch it move!

## ❓ Still Having Issues?

If dragging still doesn't work after selecting:

1. Make sure you're clicking the same node to drag
2. Check that the grab cursor (✋) appears
3. Try clicking to select, pause, then drag
4. Look for the ⋮⋮ drag handle on the right
5. Ensure you're not in edit mode (double-click exits edit)

---

**Remember:** CLICK to select → Red border → DRAG the selected node! ✨
