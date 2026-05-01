import INode, { INodeData, ConnectionType } from './INode'
import Layout from './Layout'
import { Notice, Platform } from 'obsidian'
import SVG from 'svg.js'
import { MindMapView } from '../MindMapView'
import { frontMatterKey, basicFrontmatter } from '../constants';
import Exec from './Execute'
import {uuid} from '../MindMapView'
import { ConnectionTypeModal } from '../modals'

import importXmind  from './import/xmindZen'
import jsZip from 'jszip'
import { t } from 'src/lang/helpers'

let deleteIcon = '<svg class="icon" width="16px" height="16.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path  d="M799.2 874.4c0 34.4-28 62.4-62.368 62.4H287.2a62.496 62.496 0 0 1-62.4-62.4V212h574.4v662.4zM349.6 100c0-7.2 5.6-12.8 12.8-12.8h300c7.2 0 12.768 5.6 12.768 12.8v37.6H349.6V100z m636.8 37.6H749.6V100c0-48-39.2-87.2-87.2-87.2h-300a87.392 87.392 0 0 0-87.2 87.2v37.6H37.6C16.8 137.6 0 154.4 0 175.2s16.8 37.6 37.6 37.6h112v661.6A137.6 137.6 0 0 0 287.2 1012h449.6a137.6 137.6 0 0 0 137.6-137.6V212h112c20.8 0 37.6-16.8 37.6-37.6s-16.8-36.8-37.6-36.8zM512 824c20.8 0 37.6-16.8 37.6-37.6v-400c0-20.8-16.768-37.6-37.6-37.6-20.8 0-37.6 16.8-37.6 37.6v400c0 20.8 16.8 37.6 37.6 37.6m-175.2 0c20.8 0 37.6-16.8 37.6-37.6v-400c0-20.8-16.8-37.6-37.6-37.6s-37.6 16.8-37.6 37.6v400c0.8 20.8 17.6 37.6 37.6 37.6m350.4 0c20.8 0 37.632-16.8 37.632-37.6v-400c0-20.8-16.8-37.6-37.632-37.6-20.768 0-37.6 16.8-37.6 37.6v400c0 20.8 16.8 37.6 37.6 37.6" /></svg>';
let addIcon = '<svg class="icon" width="16px" height="16.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path  d="M512 1024C230.4 1024 0 793.6 0 512S230.4 0 512 0s512 230.4 512 512-230.4 512-512 512z m0-960C265.6 64 64 265.6 64 512s201.6 448 448 448 448-201.6 448-448S758.4 64 512 64z"  /><path d="M800 544H224c-19.2 0-32-12.8-32-32s12.8-32 32-32h576c19.2 0 32 12.8 32 32s-12.8 32-32 32z"  /><path  d="M512 832c-19.2 0-32-12.8-32-32V224c0-19.2 12.8-32 32-32s32 12.8 32 32v576c0 19.2-12.8 32-32 32z"  /></svg>';
let tempDispLevel = 0;

interface Setting {
    theme?: string;
    canvasSize?: number;
    background?: string;
    fontSize?: number;
    color?: string,
    exportMdModel?: string,
    headLevel: number,
    layoutDirect: string,
    strokeArray?:any[],
    focusOnMove?: boolean,
    graphMode?: boolean
}

export default class MindMap {
    root: INode;
    roots: INode[] = []; // Support multiple root nodes
    status: string;
    appEl: HTMLElement;
    contentEL: HTMLElement;
    containerEL: HTMLElement;
    path?: string;
    editNode?: INode;
    selectNode?: INode;
    lastSelectedNode?: INode;
    // selectingNodes?:boolean;
    // selectedNodes?: INode[];
    setting: Setting;
    data: INodeData;
    drag?: boolean;
    startX?: number;
    startY?: number;
    dx?: number;
    dy?: number;
    mmLayout?: Layout;
    draw: any;
    edgeGroup: any;
    _nodeNum: number = 0;
    _tempNum: number = 0;
    view?: MindMapView;
    colors: string[] = [];
    _dragNode: INode;
    exec: Exec;
    scalePointer: number[] = [];
    mindScale = 100;
    timeOut: any = null;
    _indicateDom:HTMLElement;
    _menuDom:HTMLElement;
    _dragType:string='';
    _dragoverCount:number = 0;
    _left:number;
    _top:number;
    dispLevel:number;
    isComposing = false;
    isFocused = true;
    _nodeDragMode: boolean = false;
    _currentDropTarget: INode = null;
    _isReparentDrag: boolean = false;  // Alt+drag for reparenting vs normal drag for positioning
    _dragStartPos: {x: number, y: number} = null;  // Original position of dragged node
    _rafId: number = null;  // RequestAnimationFrame ID for throttling refresh during drag
    _forcedReparentMode: boolean = false;  // Manual toggle for reparent mode (Ctrl+Shift+D)
    _autoReparentFloating: boolean = false;  // Floating nodes auto-enter reparent mode
    _lastMouseX: number = 0;  // Track last mouse position for instant node creation
    _lastMouseY: number = 0;
    selectedNodes: INode[] = [];  // Multi-select support
    _nodeCreationCount: number = 0;  // Counter for auto-spacing created nodes
    _lastCreationPosition: {x: number, y: number} = null;  // Last node creation position
    connectionGroup: any;  // SVG group for non-hierarchical connections
    _connectionMode: boolean = false;  // Whether in connection creation mode
    _connectionSourceNode: INode = null;  // Source node when creating connection
    app?: any;  // Obsidian app instance for modals
    _dragThreshold: number = 5;  // Minimum pixels to move before drag starts (prevents double-click issues)
    _hasDragStarted: boolean = false;  // Track if drag has actually started

    constructor(data: INodeData, containerEL: HTMLElement, setting?: Setting, app?: any) {
        this.setting = Object.assign({
            theme: 'default',
            //canvasSize: 8000,
            canvasSize: 36000,
            fontSize: 16,
            background: 'transparent',
            color: 'inherit',
            exportMdModel: 'default',
            headLevel: 2,
            layoutDirect: ''
        }, setting || {});


        this.data = data;
        this.app = app;
        this.appEl = document.createElement('div');

        this.appEl.classList.add('mm-mindmap');
        this.appEl.classList.add(`mm-theme-${this.setting.theme}`);
        this.appEl.style.overflow = "auto";

        // Make appEl focusable so keyboard events work
        this.appEl.setAttribute('tabindex', '-1');
        this.appEl.style.outline = 'none'; // Remove focus outline

        // Apply graph mode class if enabled
        if (this.setting.graphMode) {
            this.appEl.classList.add('mm-graph-mode');
        }


        this.contentEL = document.createElement('div');
        this.contentEL.style.position = "relative";
        this.contentEL.style.width = "100%";
        this.contentEL.style.height = "100%";
        this.appEl.appendChild(this.contentEL);
        this.draw = SVG(this.contentEL).size('100%', '100%');

        // CRITICAL: Make SVG pass through drag events to nodes beneath
        const svgElement = this.contentEL.querySelector('svg');
        if (svgElement) {
            svgElement.style.pointerEvents = 'none';
        }

        this.setAppSetting();
        containerEL.appendChild(this.appEl);
        this.containerEL = containerEL;

        //layout direct
        this._indicateDom = document.createElement('div');
        this._indicateDom.classList.add('mm-node-layout-indicate');
        this._indicateDom.style.display='none';

        //menu
        this._menuDom = document.createElement('div');
        this._menuDom.classList.add('mm-node-menu');
        this._menuDom.style.display='none';
        this.setMenuIcon();

        this.contentEL.appendChild(this._indicateDom);
        this.contentEL.appendChild(this._menuDom);

        //history
        this.exec = new Exec();

        // link line (hierarchical tree connections)
        this.edgeGroup = this.draw.group();

        // connection group (many-to-many graph connections)
        this.connectionGroup = this.draw.group();

        this.appClickFn = this.appClickFn.bind(this);
        this.appDragstart = this.appDragstart.bind(this);
        this.appDragend = this.appDragend.bind(this);
        this.appDragover = this.appDragover.bind(this);
        this.appDblclickFn = this.appDblclickFn.bind(this);
        this.appMouseOverFn = this.appMouseOverFn.bind(this);
        this.appDrop = this.appDrop.bind(this);
        this.appKeyup = this.appKeyup.bind(this);
        this.compositionStart = this.compositionStart.bind(this);
        this.compositionEnd = this.compositionEnd.bind(this);

        this.appKeydown = this.appKeydown.bind(this);
        this.appMousewheel = this.appMousewheel.bind(this);
        this.appMouseMove = this.appMouseMove.bind(this);

        this.appMouseDown = this.appMouseDown.bind(this);
        this.appMouseUp = this.appMouseUp.bind(this);

        this.appFocusIn = this.appFocusIn.bind(this);
        this.appFocusOut = this.appFocusOut.bind(this);

        //custom event
        this.initNode = this.initNode.bind(this);
        this.renderEditNode = this.renderEditNode.bind(this);
        this.mindMapChange = this.mindMapChange.bind(this);

        this.initEvent();
        //this.center();
        this.dispLevel=0;

        // Defensive: Reset SVG pointer-events if stuck (e.g., after crash during drag)
        setInterval(() => {
            if (!this.drag && !this._nodeDragMode) {
                const svgElement = this.contentEL.querySelector('svg');
                if (svgElement && svgElement.style.pointerEvents === 'none') {
                    console.warn('[SVG] Fixing stuck pointer-events');
                    svgElement.style.pointerEvents = 'auto';
                }
            }
        }, 5000); // Check every 5 seconds
    }

    setMenuIcon(){
        var addNodeDom = document.createElement('span');
        var deleteNodeDom = document.createElement('span');
        addNodeDom.classList.add('mm-icon-add-node');
        deleteNodeDom.classList.add('mm-icon-delete-node');
        addNodeDom.innerHTML = addIcon;
        deleteNodeDom.innerHTML = deleteIcon;
        this._menuDom.appendChild(addNodeDom);
        this._menuDom.appendChild(deleteNodeDom);
    }

    setAppSetting() {
        this.appEl.style.width = `${this.setting.canvasSize}px`;
        this.appEl.style.height = `${this.setting.canvasSize}px`;
        this.contentEL.style.width = `100%`;
        this.contentEL.style.height = `100%`;
        //  this.contentEL.style.color=`${this.setting.color};`;
        this.contentEL.style.background = `${this.setting.background}`;
        this.contentEL.style.fontSize = `${this.setting.fontSize}px`;
    }
    //create node
    init(collapsedIds?: string[]) {
        var that = this;
        var data = this.data;
        var waitCollapseNodes:INode[]=[];

        // Calculate positions for multiple roots
        const rootSpacing = 800; // Horizontal spacing between roots
        const startX = this.setting.canvasSize / 2 - 60;
        const startY = this.setting.canvasSize / 2 - 200;

        function initNode(d: INodeData, isRoot: boolean, rootIndex: number, p?: INode) {
            that._nodeNum++;
            var n = new INode(d, that);

            that.contentEL.appendChild(n.containEl);
            if (isRoot) {
                // Position roots horizontally spaced apart
                const x = startX + (rootIndex * rootSpacing);
                const y = startY;
                n.setPosition(x, y);
                that.root = n; // Keep backward compatibility - points to first root
                that.roots.push(n);
                n.data.isRoot = true;
            } else {
                n.setPosition(0, 0);
                p.children.push(n);
                n.parent = p;
            }

            n.refreshBox();

            if(!d.expanded){
                waitCollapseNodes.push(n)
            }
            n.refreshBox();
            if (d.children && d.children.length) {
                d.children.forEach((dd: INodeData) => {
                    initNode(dd, false, rootIndex, n);
                });
            }
        }

        // Initialize the main root
        initNode(data, true, 0);

        if(waitCollapseNodes.length){
            waitCollapseNodes.forEach(n=>{
                n.collapse();
            });
        }
    }

    traverseBF(callback: Function, node?: INode) {
        if (node) {
            // Traverse from specific node
            var array = [];
            array.push(node);
            var currentNode = array.shift();
            while (currentNode) {
                for (let i = 0, len = currentNode.children.length; i < len; i++) {
                    array.push(currentNode.children[i]);
                }
                callback(currentNode);
                currentNode = array.shift();
            }
        } else {
            // Traverse all roots
            this.roots.forEach(root => {
                var array = [];
                array.push(root);
                var currentNode = array.shift();
                while (currentNode) {
                    for (let i = 0, len = currentNode.children.length; i < len; i++) {
                        array.push(currentNode.children[i]);
                    }
                    callback(currentNode);
                    currentNode = array.shift();
                }
            });
        }
    }

    traverseDF(callback: Function, node?: INode, cbFirst?: boolean) {
        function recurse(currentNode: INode) {
            if (currentNode) {
                if (cbFirst) {
                    callback(currentNode);
                }
                if (currentNode.children) {
                    for (var i = 0, length = currentNode.children.length; i < length; i++) {
                        recurse(currentNode.children[i]);
                    }
                }
                if (!cbFirst) {
                    callback(currentNode);
                }
            }
        }
        if (node) {
            recurse(node);
        } else {
            // Traverse all roots
            this.roots.forEach(root => recurse(root));
        }
    }

    getNodeById(id: string) {
        var snode: INode = null;
        this.traverseDF((n: INode) => {
            if (n.getId() == id) {
                snode = n;
            }
        });

        return snode;
    }

    clearSelectNode() {
        if (this.selectNode) {
            this.lastSelectedNode = this.selectNode;
            this.selectNode.unSelect();
            this.selectNode = null
        }
        if (this.editNode) {
            if(this.editNode.data.isEdit){
                this.editNode.cancelEdit();
            }
            this.editNode = null;
        }

        // Clear multi-select
        this.selectedNodes.forEach(node => node.unSelect());
        this.selectedNodes = [];

        // if(this.selectingNodes)
        // {// Add the node to the selectedNodes
        //     this.selectedNodes.push(this.selectNode);
        // }
        // else {
        //     this.selectedNodes = [];
        // }
        // console.log(this.selectedNodes.length+" selected: "+this.selectedNodes);

        // if (this.selectNode) {
        //     this.selectNode.unSelect();
        //     this.selectNode = null
        // }
        // if (this.editNode) {
        //     if(this.editNode.data.isEdit){
        //         this.editNode.cancelEdit();
        //     }
        //     this.editNode = null;
        // }
    }


    initEvent() {
        this.appEl.addEventListener('click', this.appClickFn);
        this.appEl.addEventListener('mouseover', this.appMouseOverFn);
        this.appEl.addEventListener('dblclick', this.appDblclickFn);
        this.appEl.addEventListener('dragstart', this.appDragstart);

        // Add drag events to both appEl and document for better compatibility
        this.appEl.addEventListener('dragover', this.appDragover);
        this.appEl.addEventListener('dragend', this.appDragend);
        this.appEl.addEventListener('drop', this.appDrop);

        // CRITICAL: Also add to document to catch all drag events
        document.addEventListener('dragover', this.appDragover);
        document.addEventListener('drop', this.appDrop);

        // Re-enabled: Keyboard handlers have proper guards to not interfere with editing
        this.appEl.addEventListener('keyup', this.appKeyup);
        this.appEl.addEventListener('keydown', this.appKeydown);
        this.appEl.addEventListener('compositionstart',this.compositionStart);
        this.appEl.addEventListener('compositionend',this.compositionEnd);

        document.body.addEventListener('mousewheel', this.appMousewheel);

        if(Platform.isDesktop){
            this.appEl.addEventListener('mousedown', this.appMouseDown);
            this.appEl.addEventListener('mouseup', this.appMouseUp);
        }

        this.appEl.addEventListener('mousemove', this.appMouseMove);

        this.containerEL.addEventListener('focusin', this.appFocusIn);
        this.containerEL.addEventListener('focusout', this.appFocusOut);
        //custom event
        this.on('initNode', this.initNode);
        this.on('renderEditNode', this.renderEditNode);
        this.on('mindMapChange', this.mindMapChange);

    }

    removeEvent() {
        this.appEl.removeEventListener('click', this.appClickFn);
        this.appEl.removeEventListener('dragstart', this.appDragstart);
        this.appEl.removeEventListener('dragover', this.appDragover);
        this.appEl.removeEventListener('dragend', this.appDragend);
        this.appEl.removeEventListener('dblClick', this.appDblclickFn);
        this.appEl.removeEventListener('mouseover', this.appMouseOverFn);
        this.appEl.removeEventListener('drop', this.appDrop);

        // Remove document listeners
        document.removeEventListener('dragover', this.appDragover);
        document.removeEventListener('drop', this.appDrop);

        // Remove keyboard listeners
        this.appEl.removeEventListener('keyup', this.appKeyup);
        this.appEl.removeEventListener('keydown', this.appKeydown);
        this.appEl.removeEventListener('compositionstart',this.compositionStart);
        this.appEl.removeEventListener('compositionend',this.compositionEnd);

        document.body.removeEventListener('mousewheel', this.appMousewheel);

        if(Platform.isDesktop){
            this.appEl.removeEventListener('mousedown', this.appMouseDown);
            this.appEl.removeEventListener('mouseup', this.appMouseUp);
        }

        this.appEl.removeEventListener('mousemove', this.appMouseMove);

        this.containerEL.removeEventListener('focusin', this.appFocusIn);
        this.containerEL.removeEventListener('focusout', this.appFocusOut);

        this.off('initNode', this.initNode);
        this.off('renderEditNode', this.renderEditNode);
        this.off('mindMapChange', this.mindMapChange);
    }

    initNode(evt: CustomEvent) {
        this._tempNum++;
        //console.log(this._nodeNum,this._tempNum);

        if (this._tempNum == this._nodeNum) {
            this.refresh();
            //this.center();
        }
    }

    renderEditNode(evt: CustomEvent) {
        var node = evt.detail.node || null;
        node?.clearCacheData();
        this.refresh();
    }

    mindMapChange() {
        //console.log(this.view)
        this.view?.mindMapChange();
    }
    appFocusIn(evt: FocusEvent){
        setTimeout(() => {
            if (this.containerEL.contains(evt.relatedTarget as Node)) return;
            this.isFocused = true;
        }, 100);
    }
    appFocusOut(evt: FocusEvent){
        if (this.containerEL.contains(evt.relatedTarget as Node)) return;
        this.isFocused = false;
    }
    appKeydown(e: KeyboardEvent) {
        // CRITICAL: If any node is being edited, don't intercept keyboard events
        if (this.editNode && this.editNode.data.isEdit) {
            return;
        }

        // CRITICAL: Don't intercept if target is an input/textarea/contenteditable
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)) {
            return;
        }

        // CRITICAL: Don't intercept if any modal is open
        if (document.querySelector('.modal-container, .modal')) {
            return;
        }

        // CRITICAL: Don't intercept if focus is not on mindmap
        if (!this.isFocused || document.activeElement !== this.appEl) {
            return;
        }

        var keyCode = e.keyCode || e.which || e.charCode;
        var ctrlKey = e.ctrlKey || e.metaKey;
        var shiftKey = e.shiftKey;
        var altKey = e.altKey;

        // if (ctrlKey) {                         // Shift -> Selecting
        //     // ctrl -> selecting
        //     this.selectingNodes = true;
        // } else {
        //     this.selectingNodes = false;
        // }

        if (!ctrlKey && !shiftKey && !altKey) { // No special key
            // // tab
            // // tab (OK) / Insert (OK)
            // if (keyCode == 9 || keyCode == 45) {
            //     e.preventDefault();
            //     e.stopPropagation();
            // }

            // // Space
            // if (keyCode == 32) {
            //     var node = this.selectNode;
            //     if (node && !node.data.isEdit) {
            //         e.preventDefault();
            //         e.stopPropagation();
            //         node.edit();
            //         this._menuDom.style.display = 'none';
            //     }
            // }


        }


        if (ctrlKey && !shiftKey && !altKey) {  // CTRL key
        //     //ctrl + y
        //     if (keyCode == 89) {
        //         e.preventDefault();
        //         e.stopPropagation();
        //         this.redo();
        //     }

        //     //ctrl + z
        //     if (keyCode == 90) {
        //         e.preventDefault();
        //         e.stopPropagation();
        //         this.undo();
        //     }
        }

            // Shift + F2 : Edit as space does
        // if (!ctrlKey && shiftKey && !altKey) {  // SHIFT key
        //     if (keyCode == 113) {
        //     // if (keyCode == 45) {
        //         var node = this.selectNode;
        //         if (node && !node.data.isEdit) {
        //             e.preventDefault();
        //             e.stopPropagation();
        //             if (!node.isExpand) {
        //                 node.expand();
        //             }
        //             if (!node.parent) return;
        //             node.mindmap.execute('addSiblingNode', {
        //                 parent: node.parent
        //             });
        //             this._menuDom.style.display='none';
        //         }
        //     }
        // }
    }

     compositionStart(e: KeyboardEvent) {

        this.isComposing = true;
     }
     compositionEnd(e: KeyboardEvent) {

        this.isComposing = false;
     }

    appKeyup(e: KeyboardEvent) {
        console.log('[KEYUP] Key pressed:', {
            key: e.key,
            keyCode: e.keyCode,
            isFocused: this.isFocused,
            hasSelectNode: !!this.selectNode,
            selectNodeText: this.selectNode?.data.text,
            isEdit: this.editNode?.data.isEdit,
            target: (e.target as HTMLElement)?.tagName
        });

        // CRITICAL: If any node is being edited, don't intercept keyboard events
        if (this.editNode && this.editNode.data.isEdit) {
            console.log('[KEYUP] Ignoring - node is being edited');
            return;
        }

        // CRITICAL: Don't intercept if target is an input/textarea/contenteditable
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)) {
            console.log('[KEYUP] Ignoring - target is input/textarea/contenteditable');
            return;
        }

        // CRITICAL: Don't intercept if any modal is open
        if (document.querySelector('.modal-container, .modal')) {
            console.log('[KEYUP] Ignoring - modal is open');
            return;
        }

        // CRITICAL: Don't intercept if focus is not on mindmap
        if (!this.isFocused || document.activeElement !== this.appEl) {
            console.log('[KEYUP] Ignoring - mindmap not focused or activeElement mismatch');
            return;
        }

        var keyCode = e.keyCode || e.which || e.charCode;
        var ctrlKey = e.ctrlKey || e.metaKey;
        var shiftKey = e.shiftKey;
        var altKey = e.altKey;

        // if (ctrlKey) {                         // Shift -> Selecting
        //     // Ctrl -> selecting
        //     this.selectingNodes = true;
        // } else {
        //     this.selectingNodes = false;
        // }

        if (!ctrlKey && !shiftKey && !altKey) { // NO SPECIAL KEY
            // Enter
            // if (keyCode == 13 || e.key =='Enter') {
            //     var node = this.selectNode;
            //     e.preventDefault();
            //     e.stopPropagation();
            //     if(node) {// A node is selected
            //         if (!node.data.isEdit) {// Not editing a node => Add sibling node
            //             if (!node.isExpand) {
            //                 node.expand();
            //             }
            //             if (!node.parent) return;
            //             node.mindmap.execute('addSiblingNode', {
            //                 parent: node.parent
            //             });
            //             this._menuDom.style.display='none';
            //         }
            //         else {// Editing mode => end edit mode
            //             //node.cancelEdit();

            //             this.clearSelectNode();
            //             node.select();
            //             node.mindmap.editNode=null;
            //             //this.selectNode.unSelect();
            //         }
            //     }
            //     //else: no node selected: nothing to do
            // }

            // Delete key or Backspace (safe due to guards: not editing, no modals, mindmap focused)
            if (keyCode == 46 || keyCode == 8 || e.key == 'Delete' || e.key == 'Backspace') {
                console.log('[DELETE] Delete key pressed', {
                    key: e.key,
                    keyCode: keyCode,
                    shiftKey: shiftKey,
                    hasNode: !!this.selectNode,
                    nodeText: this.selectNode?.data.text,
                    isRoot: this.selectNode?.data.isRoot,
                    isEdit: this.selectNode?.data.isEdit
                });

                var node = this.selectNode;
                if (node && !node.data.isRoot && !node.data.isEdit) {
                    // Confirmation for large subtrees
                    const childCount = this.countDescendants(node);
                    if (childCount > 10) {
                        const confirmed = confirm(`Delete "${node.data.text}" and ${childCount} descendants?`);
                        if (!confirmed) {
                            console.log('[DELETE] User canceled deletion');
                            return;
                        }
                    }

                    console.log('[DELETE] Deleting node:', node.data.text);
                    e.preventDefault();
                    e.stopPropagation();
                    node.mindmap.execute("deleteNodeAndChild", { node });
                    this._menuDom.style.display='none';
                } else {
                    console.log('[DELETE] Cannot delete - either no node, is root, or is being edited');
                }
            }


            // Tab / Insert
            // if (keyCode == 9 || keyCode == 45 || e.key == 'Tab') {
            //     e.preventDefault();
            //     e.stopPropagation();
            //     var node = this.selectNode;
            //     if(node) {
            //         if (!node.data.isEdit) {// Not editing
            //             if (!node.isExpand) {
            //                 node.expand();
            //             }
            //             node.mindmap.execute("addChildNode", { parent: node });
            //             this._menuDom.style.display='none';
            //         } else{
            //             // this.selectNode.unSelect();
            //             this.clearSelectNode();
            //             node.select();
            //             node.mindmap.editNode=null;
            //         }
            //     }
            //     //else: no node selected -> nothing to do
            // }

                // Escape
            if (keyCode == 27) {
                e.preventDefault();
                e.stopPropagation();

                // Exit connection mode if active
                if (this._connectionMode) {
                    this.exitConnectionMode();
                    return;
                }

                var node = this.selectNode;
                if (node && node.data.isEdit) {
                    node.select();
                    node.mindmap.editNode = null;
                    node.cancelEdit();
                    this.undo();
                    //this.selectNode.unSelect();
                }
            }

            // up
            if (keyCode == 38 || e.key == 'ArrowUp') {
                e.preventDefault();
                e.stopPropagation();

                var node = this.selectNode;
                if( node && !node.data.isEdit )
                {
                    var l_selectedNode = node;
                    while(  (this.selectNode == node)       &&
                            (l_selectedNode != this.root)   )
                    {
                        this._selectNode(l_selectedNode, "up");
                        l_selectedNode = l_selectedNode.parent;
                    }
                }
            }

            if (keyCode == 40 || e.key == 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();

                var node = this.selectNode;
                if( node && !node.data.isEdit )
                {
                    var l_selectedNode = node;
                    while(  (this.selectNode == node)       &&
                            (l_selectedNode != this.root)   )
                    {
                        this._selectNode(l_selectedNode, "down");
                        l_selectedNode = l_selectedNode.parent;
                    }
                }
            }

            if (keyCode == 39 || e.key == 'ArrowRight') {
                e.preventDefault();
                e.stopPropagation();

                var node = this.selectNode;
                if (node && !node.data.isEdit) {
                    var rootPos = this.root.getPosition();
                    var nodePos = node.getPosition();
                    if(rootPos.x > nodePos.x)
                    {// Node on left side of the mindmap
                        node.unSelect();
                        node.parent.select();
                    }
                    else
                    {
                        var node = this.selectNode;
                        node.mindmap.execute('expandNode', {
                            node
                        });
                        this._selectNode(node, "right");
                    }
                }
            }

            if (keyCode == 37 || e.key == 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();

                var node = this.selectNode;
                if (node && !node.data.isEdit) {
                    var rootPos = this.root.getPosition();
                    var nodePos = node.getPosition();
                    if(rootPos.x < nodePos.x)
                    {// Node on right side of the mindmap
                        node.unSelect();
                        node.parent.select();
                    }
                    else
                    {
                        var node = this.selectNode;
                        node.mindmap.execute('expandNode', {
                            node
                        });
                        this._selectNode(node, "left");
                    }
                }
            }

            // Home : Select root node
            if (keyCode == 36) {
                e.preventDefault();
                e.stopPropagation();

                if( (!this.selectNode)          ||
                    (!this.selectNode.data.isEdit)   )
                {// No edition: select root node
                    if(this.selectNode)
                    { this.selectNode.unSelect(); }
                    this.root.select();
                    this.center();
                }
            }
        }


        if (ctrlKey && !shiftKey && !altKey) {  // CTRL KEY
            /*//ctr + /  (or Ctrl + NumpadDivide) toggle expand node
            // if ((keyCode == 191) || (keyCode == 111)) {
            //     var node = this.selectNode;
            //     this._toggleExpandNode(node);
            // }
            if ((keyCode == 191) || (keyCode == 111)) {
                var node = this.selectNode;
                if (node && !node.data.isEdit) {
                    if (node.isExpand) {
                        node.mindmap.execute('collapseNode', {
                            node
                        })
                    } else {
                        node.mindmap.execute('expandNode', {
                            node
                        })
                    }
                }
            }*/

            // Ctrl + B => Bold
            // if (keyCode == 66) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     if(this.selectNode) {
            //         var l_prefix_1 = "**";
            //         var l_prefix_2 = "__";
            //         var node = this.selectNode;

            //         if(node.data.isEdit)
            //         {// A node is edited: set in bold only the selected part
            //             var l_check_prefix = true;
            //             node.setSelectedText(l_prefix_1, l_prefix_2, l_check_prefix);
            //         }

            //         else
            //         {// Set in bold the whole node
            //             this._formatNode(node, l_prefix_1, l_prefix_2);
            //             e.preventDefault();
            //             e.stopPropagation();
            //         }

            //         this.refresh();
            //         this.scale(this.mindScale);
            //     }
            //     //else: no node selected: nothing to do
            // }


            // Ctrl + I => Italic
            // if (keyCode == 73) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     if(this.selectNode) {
            //         var node = this.selectNode;

            //         if(node.data.isEdit)
            //         {// A node is edited: set in italics only the selected part
            //             node.setSelectedText_italic();
            //         }

            //         else
            //         {// Set in italics the whole node
            //             var text = node.data.text;
            //             if( (  ((text.substring(0,1)=="*") ||
            //                     (text.substring(0,1)=="_") )        &&
            //                 (text.substring(0,2)!="**")             &&
            //                 (text.substring(0,2)!="__")             )   ||
            //                 (text.substring(0,3)=="***")                ||
            //                 (text.substring(0,3)=="___")                )
            //             {// Already italic
            //                 text = text.substring(1); // Remove leading * / _

            //                 if( (text.substring(text.length-1)=="*") ||
            //                     (text.substring(text.length-1)=="_") )   {
            //                     // Remove trailing * / _
            //                     text = text.substring(0,text.length-1);
            //                 }
            //                 // else: no trailing *
            //             }
            //             else {// Not in italic
            //                 text = "*"+text+"*"; // Use "*" to allow bold/italic change in whatever order
            //             }

            //             // Set in node text
            //             node.data.oldText = node.data.text;
            //             node.setText(text);
            //             e.preventDefault();
            //             e.stopPropagation();
            //         }

            //         this.refresh();
            //         this.scale(this.mindScale);
            //     }
            //     //else: no node selected: nothing to do
            // }


            // ctrl + E  center mindmap view
            // if (keyCode == 69) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     //this.center();
            //     this.centerOnNode(this.selectNode);
            // }


            // ctrl + Up: Move one node above
            // if (keyCode == 38 || e.key == 'ArrowUp') {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(!node)
            //     {// No node selected: select root node
            //         this.root.select();
            //         node = this.selectNode;
            //     }
            //     else if((!node.data.isEdit)  &&
            //             (!node.data.isRoot)  )
            //     {// The node can be moved
            //         var type='top';
            //         if(node.getIndex() == 0)
            //         {// First sibling: move BELOW "previous" (=last) node
            //             type='down';
            //         }
            //         //else: no special treatment
            //         this.moveNode(node, node.getPreviousSibling(), type);
            //     }
            //     this.centerOnNode(this.selectNode);
            // }


            // // Ctrl + Down: Move one step below
            // if (keyCode == 40 || e.key == 'ArrowDown') {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(!node)
            //     {// No node selected: select root node
            //         this.root.select();
            //         node = this.selectNode;
            //     }
            //     else if((!node.data.isEdit)  &&
            //             (!node.data.isRoot)  )
            //     {// The node can be moved
            //         var type='down';
            //         if(node.getIndex() == node.parent.children.length-1)
            //         {// Last sibling: move ABOVE "next" (=first) node
            //             type='top';
            //         }
            //         //else: no special treatment
            //         this.moveNode(node, node.getNextSibling(), type);
            //     }
            //     this.centerOnNode(this.selectNode);
            // }


            // // Ctrl + Left
            // if (keyCode == 37 || e.key == 'ArrowLeft') {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(!node)
            //     {// No node selected: select root node
            //         this.root.select();
            //         node = this.selectNode;
            //     }
            //     else {// Move current node as parent/child depending on the position
            //         var rootPos = this.root.getPosition();
            //         var nodePos = node.getPosition();
            //         if(rootPos.x < nodePos.x)
            //         {
            //             this._moveAsParent(node);
            //         }
            //         else
            //         {
            //             this._moveAsChild(node, node.getPreviousSibling());
            //         }
            //     }
            //     this.centerOnNode(this.selectNode);
            // }


            // // Ctrl + Right
            // if (keyCode == 39 || e.key == 'ArrowRight') {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(!node)
            //     {// No node selected
            //         this.root.select();
            //         node = this.selectNode;
            //     }
            //     else {
            //         var rootPos = this.root.getPosition();
            //         var nodePos = node.getPosition();
            //         if(rootPos.x < nodePos.x)
            //         {
            //             // this.selectedNodes.forEach((n:INode) => {
            //             //     this._moveAsChild(n);
            //             // });
            //             this._moveAsChild(node, node.getPreviousSibling());
            //         }
            //         else
            //         {
            //             this._moveAsParent(node);
            //         }
            //     }
            //     this.centerOnNode(this.selectNode);
            // }


            // // Ctrl + J: Join with following node
            // if (keyCode == 74) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(node)
            //     {  this.joinWithFollowingNode(node); }
            //     // else: No node selected: nothing to do
            // }



            // Ctrl + Home : Select root node
            if (keyCode == 36) {
                e.preventDefault();
                e.stopPropagation();

                if( (!this.selectNode)              ||
                    (!this.selectNode.data.isEdit)  )
                {// No edition: select root node
                    if(this.selectNode && !this.selectNode.data.isRoot)
                    {
                        this.selectNode.unSelect();
                        this.root.select();
                    }
                    this.center();
                }
            }
        }


        if (ctrlKey && shiftKey && !altKey) {   // CTRL + SHIFT key
            // //Shift + Ctrl + space: toggle expand node
            // if (keyCode == 32) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(node)
            //     { this._toggleExpandNode(node); }
            // }


            // Ctrl + Shift + Z => Old text
            // if (keyCode == 90) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(node) {
            //         // var text = (node.data.oldText as string);
            //         var text = (node.data.oldText);
            //         node.setText(text);
            //         e.preventDefault();
            //         e.stopPropagation();
            //         console.log(text+" / "+node.data.text);
            //     }
            // }


            // Ctrl + Shift + Home : Center map
            // if (keyCode == 36) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     this.center();
            // }

        }


        if (altKey && !ctrlKey && !shiftKey) {          // Alt key

            // Alt + H => Highlight
            // if (keyCode == 72) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     if(this.selectNode) {// There is a node selected: format
            //         var l_prefix_1 = "==";
            //         var l_prefix_2 = l_prefix_1;
            //         var node = this.selectNode;

            //         if(node.data.isEdit)
            //         {// A node is edited: set in bold only the selected part
            //             var l_check_prefix = true;
            //             node.setSelectedText(l_prefix_1, l_prefix_2, l_check_prefix);
            //         }

            //         else
            //         {// Set in bold the whole node
            //             this._formatNode(node, l_prefix_1, l_prefix_2);
            //             e.preventDefault();
            //             e.stopPropagation();
            //         }
            //     }
            //     //else: no node selected: nothing to do
            // }


            // Alt + é => Strike through
            // if (keyCode == 50) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     if(this.selectNode) {// There is a node selected: format
            //         var l_prefix_1 = "~~";
            //         var l_prefix_2 = l_prefix_1;
            //         var node = this.selectNode;

            //         if(node.data.isEdit)
            //         {// A node is edited: set in bold only the selected part
            //             var l_check_prefix = true;
            //             node.setSelectedText(l_prefix_1, l_prefix_2, l_check_prefix);
            //         }

            //         else
            //         {// Set in bold the whole node
            //             this._formatNode(node, l_prefix_1, l_prefix_2);
            //             e.preventDefault();
            //             e.stopPropagation();
            //         }
            //     }
            //     //else: no node selected: nothing to do
            // }


            // Alt + Home : Node info in console
            // if (keyCode == 36) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     var node = this.selectNode;
            //     if(node) {
            //         console.log("Node idx: "+node.getIndex());
            //         console.log("Previous node idx: "+node.getPreviousSibling().getIndex());
            //         console.log("Next node idx: "+node.getNextSibling().getIndex());
            //         console.log("Node pos: x="+node.getPosition().x+" / y="+node.getPosition().y);
            //         console.log("Node dim: x="+node.getDimensions().x+" / y="+node.getDimensions().y);
            //         console.log("Canvas: "+this.setting.canvasSize);
            //         console.log("Disp scroll: x="+this.containerEL.scrollLeft+" / y="+this.containerEL.scrollTop);
            //         console.log("Disp client: x="+this.containerEL.clientWidth+" / y="+this.containerEL.clientHeight);

            //         //node.setText
            //     }
            // }


            // // Alt + PageUp: collapse one level from max displayed level
            // if (keyCode == 33) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     node = this.selectNode;
            //     if( (node)                                                  &&
            //         (this.getMaxNodeDisplayedLevel(node)>node.getLevel())   )
            //     {// Collapse only if current selected node would not be hidden
            //         this.setChildrenDisplayedLevel(this.getMaxNodeDisplayedLevel(node)-1);
            //         this.refresh();
            //         this.scale(this.mindScale);
            //         this.selectNode.select();
            //     }
            // }


            // // Alt + PageDn: expand one level
            // if (keyCode == 34) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     node = this.selectNode;
            //     if(node) {
            //         this.setChildrenDisplayedLevel(this.getMaxNodeDisplayedLevel(node)+1);
            //         this.refresh();
            //         this.scale(this.mindScale);
            //         this.selectNode.select();
            //     }
            // }


        }


        if (altKey && !ctrlKey && shiftKey) {           // Alt + Shift key

            // Alt + Shift + PageUp: collapse one level from current node
            // if (keyCode == 33) {
            //     if(this.selectNode) {
            //         this.setDisplayedLevel(this.selectNode.getLevel()-1);
            //         this.refresh();
            //         this.selectNode.parent.select();
            //     }
            // }


            // Alt + PageDn: expand one level
            // if (keyCode == 34) {
            //     if(this.selectNode) {
            //         this.setDisplayedLevel(this.selectNode.getLevel()+1);
            //         this.refresh();
            //         this.selectNode.select();
            //     }
            // }

        }


        if (altKey && ctrlKey && !shiftKey) {           // Alt + Ctrl key
            // Alt + Ctrl + S: Select node's text
            // if (keyCode == 83) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     let node = this.selectNode;
            //     if(node) {
            //         node.edit();
            //         node.selectText();
            //     }
            // }


        }


        if (altKey && ctrlKey && shiftKey) {            // Alt + Ctrl+ Shift key
            // None
            // if (keyCode == xx) {
            //     e.preventDefault();
            //     e.stopPropagation();

            //     let node = this.selectNode;
            //     if(node) {
            //         TBD
            //     }
            // }
        }


    }
    _hierarchySelectNode(node: INode, direct: string){
        if (!node) {
            return;
        }
        var viewportWidth = this.containerEL.clientWidth;
        var viewportHeight = this.containerEL.clientHeight;
        var diagonalViewport = Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight);
        const MAX_PARENT_DISTANCE = diagonalViewport / 5;
        var waitNode: INode = null;
        var nodePos = node.getPosition();
        // var mind = this;
        var rootPos = this.root.getPosition();
        var rootDirect = rootPos.x > nodePos.x ? 'right' : 'left';

        if (node === this.root) {
            waitNode = this.__selectChildren(node,direct);
            if (waitNode) {
                this.clearSelectNode();
                waitNode.select();
                return;
            }
        };

        if(direct === 'up'){
            if(node.parent){
                var indexOfNode = node.parent.children.indexOf(node);
                if (indexOfNode === 0 ) {
                    var parentPos = node.parent.getPosition();
                    var dx = Math.abs(parentPos.x - nodePos.x);
                    var dy = Math.abs(parentPos.y - nodePos.y);
                    var dis = Math.sqrt(dx * dx + dy * dy);
                    if(dis > MAX_PARENT_DISTANCE){
                        this._selectNode(node,direct);
                        return;
                    }
                    waitNode = node.parent;
                    this.clearSelectNode();
                    waitNode.select();
                    return;
                }else if (indexOfNode > 0){
                    waitNode = node.parent.children[indexOfNode - 1];
                    this.clearSelectNode();
                    waitNode.select();
                    return;
                }
            }
            this._selectNode(node,direct);
        }
        else if(direct === 'down'){
            if(node.parent){
                var indexOfNode = node.parent.children.indexOf(node);
                if (indexOfNode === (node.parent.children.length - 1) ) {
                    var parentPos = node.parent.getPosition();
                    var dx = Math.abs(parentPos.x - nodePos.x);
                    var dy = Math.abs(parentPos.y - nodePos.y);
                    var dis = Math.sqrt(dx * dx + dy * dy);
                    if(dis > MAX_PARENT_DISTANCE){
                        this._selectNode(node,direct);
                        return;
                    }
                    waitNode = node.parent;
                    this.clearSelectNode();
                    waitNode.select();
                    return;
                }else if (indexOfNode < (node.parent.children.length - 1)){
                    waitNode = node.parent.children[indexOfNode + 1];
                    this.clearSelectNode();
                    waitNode.select();
                    return;
                }
            }
            this._selectNode(node,direct);
        }
        else if(direct === 'right') {
            if(rootDirect === 'right' && node.parent){
                waitNode = node.parent;
                this.clearSelectNode();
                waitNode.select();
                return;
            }else{
                waitNode = this.__selectChildren(node,direct);
                if (waitNode) {
                    this.clearSelectNode();
                    waitNode.select();
                    return;
                }
            }
            // this._selectNode(node,direct);
        }
        else if(direct === 'left') {
            if(rootDirect === 'left' && node.parent){
                waitNode = node.parent;
                this.clearSelectNode();
                waitNode.select();
                return;
            }else{
                waitNode = this.__selectChildren(node,direct);
                if (waitNode) {
                    this.clearSelectNode();
                    waitNode.select();
                    return;
                }
            }
            // this._selectNode(node,direct);
        }
    }

    __selectChildren(node: INode, direct: string){
        if (!node) return;
        if (!node.isExpand) return;
        var minDis: number;
        var waitNode: INode = null;
        var pos = node.getPosition();
        if (node.children) {
            node.children.forEach(n => {
                var p = n.getPosition();
                var dx = Math.abs(p.x - pos.x);
                var dy = Math.abs(p.y - pos.y);
                var dis = Math.sqrt(dx * dx + dy * dy);
                var _helper = ()=>{
                    if (minDis) {
                        if (minDis > dis) {
                            minDis = dis;
                            waitNode = n;
                        }
                    } else {
                        minDis = dis;
                        waitNode = n;
                    }
                }
                switch (direct) {
                    case "right":
                        if (p.x > pos.x) _helper()
                        break;
                    case "left":
                        if (p.x < pos.x) _helper()
                        break;
                    case "up":
                        if (p.y < pos.y) _helper()
                        break;
                    case "down":
                        if (p.y > pos.y) _helper()
                        break;
                }
            });
        }
        return waitNode;
    }

    _formatNode(node: INode, i_prefix_1: string, i_prefix_2: string) {
        var text = node.data.text;

        if( (text.substring(0,2) == i_prefix_1)  ||
            (text.substring(0,2) == i_prefix_2)  )
        {// Prefix must be substracted, bold first
            text = text.substring(2); // Remove leading prefix

            if( (text.substring(text.length-2) == i_prefix_1)  ||
                (text.substring(text.length-2) == i_prefix_2)  )
            {// Suffix must be substracted
                text = text.substring(0,text.length-2);
            }
            // else: no trailing prefix
        }

        else if(    (text.substring(1,3) == i_prefix_1)  ||
                    (text.substring(1,3) == i_prefix_2)  )
        {// Prefix must be substracted, italic (?) first
            text = text[0] + text.substring(3); // Remove prefix

            if( (text.slice(-3, -1) == i_prefix_1)   ||
                (text.slice(-3, -1) == i_prefix_2)   )
            {// Suffix must be substracted
                text = text.substring(0,text.length-3) +
                text.slice(-1);
            }
            // else: no trailing prefix
        }

        else if(    (text.substring(2,4) == i_prefix_1)  ||
                    (text.substring(2,4) == i_prefix_2)  )
        {// Prefix must be substracted, highlight (?) first
            text = text.substring(0,2) + text.substring(4); // Remove prefix

            if( (text.slice(-4, -2) == i_prefix_1)   ||
                (text.slice(-4, -2) == i_prefix_2)   )
            {// Suffix must be substracted
                text = text.substring(0,text.length-4) +
                text.slice(-2);
            }
            // else: no trailing prefix
        }

        else {// No pre-/suf-fix: add it
            text = i_prefix_1+text+i_prefix_1;
        }

        // Set the text in the node
        node.mindmap.execute('changeNodeText',{
            node:node,
            text:text,
            oldText:node.data.text
        });
        // node.data.oldText = node.data.text;
        // node.setText(text);
        node.select();
    }


    _moveAsParent(node: INode) {
        if( (!node.data.isEdit)     &&
            (!node.data.isRoot)     &&
            (node.getLevel() > 1)   )
        {// The node can be moved
            this.moveNode(node, node.parent, 'down');
        }

        return;
    }


    _moveAsChild(movedNode: INode, newParentNode: INode) {
        if( (!movedNode.data.isEdit)  &&
            (!movedNode.data.isRoot)  )
        {// The node can be moved
            this.moveNode(movedNode, newParentNode, 'child-right');
        }


        return;
    }


    _toggleExpandNode(node: INode) {
        if (node && !node.data.isEdit) {
            if (node.isExpand) {
                node.mindmap.execute('collapseNode', {
                    node
                });
            }
            else {
                node.mindmap.execute('expandNode', {
                    node
                });
            }
        }

        return;
    }


    _selectNode(node: INode, direct: string) {
        if (!node) {
            return;
        }

        var minDis: number;
        var waitNode: INode = null;
        var pos = node.getPosition();
        var rootPos = this.root.getPosition();
        var level = node.getLevel();
        var mind = this;


        mind.traverseDF((n: INode) => {
            var p = n.getPosition();
            var l = n.getLevel();
            var dx = Math.abs(p.x - pos.x);
            var dy = Math.abs(p.y - pos.y);
            var dis = Math.sqrt(dx * dx + dy * dy);
            switch (direct) {
                case "right":
                    if( ((pos.x>this.root.getPosition().x)  &&
                         (l == level+1)                     )   ||
                        ((pos.x<this.root.getPosition().x)  &&
                         (l == level-1)                     )   ||
                        ((level == 0)                       &&
                         l==1)                                  )
                    {// The tested node is at the correct level
                        if( (n == node.parent) || (node == n.parent) )
                        {// Move only within same lineage
                            if (p.x > pos.x) {
                                if (minDis) {
                                    if (minDis > dis) {
                                        minDis = dis;
                                        waitNode = n;
                                    }
                                } else {
                                    minDis = dis;
                                    waitNode = n;
                                }
                            }
                        }
                    }
                    break;
                case "left":
                    if( ((pos.x>this.root.getPosition().x)  &&
                         (l == level-1)                     )   ||
                        ((pos.x<this.root.getPosition().x)  &&
                         (l == level+1)                     )   ||
                         ((level == 0)                      &&
                          l==1)                                 )
                    {// The tested node is at the correct level
                        if( (n == node.parent) || (node == n.parent) )
                        {// Move only within same lineage
                            if (p.x < pos.x) {
                                if (minDis) {
                                    if (minDis > dis) {
                                        minDis = dis;
                                        waitNode = n;
                                    }
                                } else {
                                    minDis = dis;
                                    waitNode = n;
                                }
                            }
                        }
                    }
                    break;
                case "up":
                    if( (n.isShow())                &&
                        (((pos.x<rootPos.x) &&
                          (p.x<rootPos.x)   )   ||
                         ((pos.x>rootPos.x) &&
                          (p.x>rootPos.x)   )   )   )
                    {// Move only on shown nodes + on the same side of the root
                        if (p.y < pos.y) {
                            if(level == l)
                            {
                                if (minDis) {
                                    if (minDis > dis) {
                                        minDis = dis;
                                        waitNode = n;
                                    }
                                } else {
                                    minDis = dis;
                                    waitNode = n;
                                }
                            }
                        }
                    }
                    break;
                case "down":
                    if( (n.isShow())                &&
                        (((pos.x<rootPos.x) &&
                          (p.x<rootPos.x)   )   ||
                         ((pos.x>rootPos.x) &&
                          (p.x>rootPos.x)   )   )   )
                    {// Move only on shown nodes + on the same side of the root
                        if (p.y > pos.y) {
                            if(level == l)
                            {
                                if (minDis) {
                                    if (minDis > dis) {
                                        minDis = dis;
                                        waitNode = n;
                                    }
                                } else {
                                    minDis = dis;
                                    waitNode = n;
                                }
                            }
                        }
                    }
                    break;
            }
        });

        if (waitNode) {
            mind.clearSelectNode();
            waitNode.select();
        }
    }

    appClickFn(evt: MouseEvent) {
        var targetEl = evt.target as HTMLElement;

        if (targetEl) {

            if (targetEl.tagName == 'A' && targetEl.hasClass("internal-link")) {
                evt.preventDefault();
                var targetEl = evt.target as HTMLElement;
                var href = targetEl.getAttr("href");
                if(href){
                    this.view.app.workspace.openLinkText(
                        href,
                        this.view.file.path,
                        evt.ctrlKey || evt.metaKey
                    );
                }
            }

            if (targetEl.hasClass('mm-node-bar') || targetEl.closest('.mm-node-bar')) {
                evt.preventDefault();
                evt.stopPropagation();
                const barEl = targetEl.hasClass('mm-node-bar') ? targetEl : targetEl.closest('.mm-node-bar');
                var id = barEl.closest('.mm-node').getAttribute('data-id');
                var node = this.getNodeById(id);

                if (!node) {
                    console.warn('[COLLAPSE] Node not found for id:', id);
                    return;
                }

                console.log('[COLLAPSE] Toggle collapse for:', node.data.text, 'isExpand:', node.isExpand);

                if (node.isExpand) {
                    node.mindmap.execute('collapseNode', {
                        node
                    });
                } else {
                    node.mindmap.execute('expandNode', {
                        node
                    });
                }
                return
            }

            if(targetEl.closest('.mm-node-menu')){
                 if(targetEl.closest('.mm-icon-add-node')){
                      var selectNode = this.selectNode;
                      if(selectNode){
                         selectNode.mindmap.execute("addChildNode", { parent: selectNode });
                         this._menuDom.style.display='none';
                      }
                 }

                 if(targetEl.closest('.mm-icon-delete-node')){
                    var selectNode = this.selectNode;
                    if(selectNode && !selectNode.data.isRoot){
                       selectNode.mindmap.execute("deleteNodeAndChild", { node: selectNode });
                       this._menuDom.style.display='none';
                    }
                 }
                 return;
            }

            if (targetEl.closest('.mm-node')) {
                var id = targetEl.closest('.mm-node').getAttribute('data-id');
                var node = this.getNodeById(id);

                if (!node) {
                    console.warn('[CLICK] Node not found for id:', id);
                    return;
                }

                console.log('[CLICK] Node clicked:', {
                    nodeText: node.data.text,
                    isRoot: node.data.isRoot,
                    isSelected: node.isSelect,
                    shiftKey: evt.shiftKey
                });

                // Shift-click for multi-select
                if (evt.shiftKey) {
                    if (node.isSelect) {
                        // Deselect if already selected
                        const index = this.selectedNodes.indexOf(node);
                        if (index > -1) {
                            this.selectedNodes.splice(index, 1);
                        }
                        node.unSelect();
                        if (this.selectedNodes.length > 0) {
                            this.selectNode = this.selectedNodes[0];
                        } else {
                            this.selectNode = null;
                        }
                    } else {
                        // Add to selection
                        if (!this.selectedNodes.includes(node)) {
                            this.selectedNodes.push(node);
                        }
                        node.select();
                        this.selectNode = node; // Keep track of last selected

                        // Give focus to mindmap so keyboard shortcuts work
                        // But not if user clicked on a link or button
                        if (!targetEl.hasClass('internal-link') &&
                            targetEl.tagName !== 'A' &&
                            targetEl.tagName !== 'BUTTON') {
                            this.appEl.focus();
                            this.isFocused = true;
                            console.log('[FOCUS] Focused appEl for keyboard events');
                        }
                    }
                    console.log('[CLICK] Multi-select:', this.selectedNodes.length, 'nodes selected');
                } else {
                    // Check if we're in connection creation mode
                    if (this._connectionMode) {
                        console.log('[CONNECTION] Creating connection to target node');
                        this.handleConnectionModeClick(node);
                        return;
                    }

                    // Normal click - single select
                    if (!node.isSelect) {
                        console.log('[CLICK] Selecting node');
                        this.clearSelectNode();
                        this.selectNode = node;
                        this.selectedNodes = [node];
                        this.selectNode?.select();
                        this._menuDom.style.display='none';

                        // Give focus to mindmap so keyboard shortcuts work immediately
                        // But not if user clicked on a link or button
                        if (!targetEl.hasClass('internal-link') &&
                            targetEl.tagName !== 'A' &&
                            targetEl.tagName !== 'BUTTON') {
                            this.appEl.focus();
                            this.isFocused = true;
                            console.log('[FOCUS] Focused appEl for keyboard events');
                        }

                        var box = this.selectNode.getBox();
                    } else if (node.data.isRoot) {
                        // If clicking on an already selected root node, toggle collapse all
                        console.log('[CLICK] Root node already selected - toggling collapse');
                        this.toggleCollapseRoot(node);
                    }
                }
            } else {
                console.log('[CLICK] Clicked outside nodes - clearing selection');
                this.clearSelectNode();
                this._menuDom.style.display='none';
            }
        }
    }

    appDragstart(evt: any) {
        evt.stopPropagation();

        // Set dataTransfer for HTML5 drag and drop
        if (evt.dataTransfer) {
            evt.dataTransfer.effectAllowed = 'move';
            evt.dataTransfer.setData('text/plain', 'mindmap-node');
        }

        this.startX = evt.pageX;
        this.startY = evt.pageY;
        if (evt.target instanceof HTMLElement) {
            if (evt.target.closest('.mm-node')) {
                var id = evt.target.closest('.mm-node').getAttribute('data-id');
                this._dragNode = this.getNodeById(id);

                if (!this._dragNode) {
                    console.warn('[DRAG] Node not found for id:', id);
                    return;
                }

                this.drag = true;

                console.log('Drag started for node:', this._dragNode.data.text);

                // Add visual feedback for dragging
                this._dragNode.containEl.classList.add('mm-dragging');
                this.appEl.classList.add('mm-dragging-active');

                // CRITICAL: Make SVG pass-through during drag to allow dragover events
                const svgElement = this.contentEL.querySelector('svg');
                if (svgElement) {
                    svgElement.style.pointerEvents = 'none';
                    console.log('SVG pointer-events set to none');
                }
            }
        }
    }

    appDragend(evt: any) {
        console.log('Drag ended');
        this.drag = false;
        this._indicateDom.style.display = 'none'
        this._menuDom.style.display = 'none';
        this._dragoverCount = 0; // Reset counter

        // Remove dragging visual feedback
        if (this._dragNode) {
            this._dragNode.containEl.classList.remove('mm-dragging');
        }
        this.appEl.classList.remove('mm-dragging-active');

        // Restore SVG pointer events for connection line hovers
        const svgElement = this.contentEL.querySelector('svg');
        if (svgElement) {
            svgElement.style.pointerEvents = 'auto';
            console.log('SVG pointer-events restored to auto');
        }

        // Remove drop target highlighting from all nodes
        this.traverseDF((node: INode) => {
            node.containEl.classList.remove('mm-drop-target');
        });
    }

    appDragover(evt: any) {
        // Log EVERY dragover to see if this function is even called
        if (!this._dragoverCount) this._dragoverCount = 0;
        this._dragoverCount++;

        if (this._dragoverCount === 1 || this._dragoverCount % 50 === 0) {
            console.log('>>> appDragover CALLED! Count:', this._dragoverCount, 'Target:', evt.target);
        }

        // CRITICAL: Must preventDefault to allow drop
        evt.preventDefault();
        evt.stopPropagation();

        // Set dropEffect
        if (evt.dataTransfer) {
            evt.dataTransfer.dropEffect = 'move';
        }

        var target =evt.target as HTMLElement;
        var x = evt.pageX;
        var y = evt.pageY;

        if (this.drag) {
            this.dx = x - this.startX;
            this.dx = y - this.startY;
        }

        // Remove previous drop target highlighting
        this.traverseDF((node: INode) => {
            node.containEl.classList.remove('mm-drop-target');
        });

        var nodeEl = target.closest('.mm-node');
        if(nodeEl){
            var nodeId = nodeEl.getAttribute('data-id');
            var node = this.getNodeById(nodeId);

            console.log('>>> Dragover on NODE:', node.data.text);

            var box = node.getBox();
            this._dragType = this._getDragType(node, x, y);
            this._indicateDom.style.display = 'block';
            this._indicateDom.style.left = box.x + box.width / 2 - 40 / 2 + 'px';
            this._indicateDom.style.top = box.y - 90 + 'px';
            this._indicateDom.className = 'mm-node-layout-indicate';

            // Highlight the drop target node
            if (node !== this._dragNode) {
                node.containEl.classList.add('mm-drop-target');
            }

            if( this._dragType == 'top') {
                this._indicateDom.classList.add('mm-arrow-top');
            } else if ( this._dragType == 'down') {
                this._indicateDom.classList.add('mm-arrow-down');
            } else if ( this._dragType == 'left') {
                this._indicateDom.classList.add('mm-arrow-left');
            } else if ( this._dragType == 'right') {
                this._indicateDom.classList.add('mm-arrow-right');
            } else {
                this._indicateDom.classList.add('drag-type');
                var arr = this._dragType.split('-');
                if (arr[1]) {
                    this._indicateDom.classList.add('mm-arrow-' + arr[1]);
                } else {
                    this._indicateDom.classList.add('mm-arrow-right');
                }
            }
        }else{
            this._indicateDom.style.display = 'none';
        }

        // CRITICAL: Return false to allow drop
        return false;
    }

    _getDragType(node:INode, x:number, y:number) {
        if (!node) return;

        var box = node.contentEl.getBoundingClientRect();

        box.x = box.x
        box.y = box.y;

        var direct = node.direct;
        switch (direct) {
            case 'right':
                if (y < box.y + box.height / 2 && x < box.x + box.width / 4 * 3) {
                    return 'top'
                }
                if (y > box.y + box.height / 2 && x < box.x + box.width / 4 * 3) {
                    return 'down'
                }
                return 'child-right'
            case 'left':
                if (y < box.y + box.height / 2 && x > box.x + box.width / 4) {
                    return 'top'
                }
                if (y > box.y + box.height / 2 && x > box.x + box.width / 4) {
                    return 'down'
                }

                return 'child-left'

            case 'top':
            case 'up':

                if (x < box.x + box.width / 4) {
                    return 'left'
                }
                if (x > box.x + box.width / 4 * 3) {
                    return 'right'
                }

                return 'child-top'
            case 'down':
            case 'bottom':
                if (x < box.x + box.width / 4) {
                    return 'left'
                }
                if (x > box.x + box.width / 4 * 3) {
                    return 'right'
                }
                return 'child-down'
            default:
                return 'child';

        }
    }

    appDrop(evt: any) {
        console.log('Drop event fired', evt);

        if (!this._dragNode) {
            console.error('No drag node set!');
            return;
        }

        if (evt.target instanceof HTMLElement) {
            if (evt.target.closest('.mm-node')) {
                evt.preventDefault();
                evt.stopPropagation();

                var dropNodeId = evt.target.closest('.mm-node').getAttribute('data-id');
                var dropNode = this.getNodeById(dropNodeId);

                console.log('Dropping', this._dragNode.data.text, 'onto', dropNode.data.text, 'type:', this._dragType);

                if (this._dragNode.data.isRoot) {
                    console.log('Cannot move root node');
                } else {
                    if (evt.ctrlKey) {// Ctrl key pressed: copy the node
                        console.log('Copying node');
                        let copiedNode = this.copyNode(this._dragNode);
                        dropNode.select();
                        this.pasteNode(copiedNode);

                    }
                    else {// Move the node
                        console.log('Moving node with type:', this._dragType);
                        this.moveNode(this._dragNode, dropNode, this._dragType);
                    }
                }
            }
        }

        var files = evt.dataTransfer.files;
            if(files.length){
                  var f = files[0];
                  if(f.name.toLowerCase().endsWith('.xmind')){
                   try{
                       var me = this;
                       var reader = new FileReader();
                       reader.onload=()=>{
                            jsZip.loadAsync(reader.result).then((e)=>{
                               var files = e.files;
                               for (var k in files) {
                                  if (k == "content.json") {
                                   files[k].async("text").then((res) => {
                                     var mindData = JSON.parse(res);
                                       var data:any = importXmind(mindData[0]);



                                       me.clearNode();
                                       me.data = data.basicData;
                                       me.init();
                                       setTimeout(()=>{
                                           me.center();
                                           me.mindMapChange();
                                       },100);
                                   });
                                 }
                               }
                            })
                       }
                       reader.readAsArrayBuffer(f);
                   }catch(err){
                      new Notice('Parse xmind error')
                   }
                  }


       }

        this._indicateDom.style.display = 'none'
        this._menuDom.style.display = 'none';
    }

    appMouseOverFn(evt: MouseEvent) {
        const targetEl = evt.target as HTMLElement;

        if (targetEl.tagName !== "A") return;

        if (targetEl.hasClass("internal-link")) {
            this.view.app.workspace.trigger("hover-link", {
                event: evt,
                source: frontMatterKey,
                hoverParent: this.view,
                targetEl,
                linktext: targetEl.getAttr("href"),
                sourcePath: this.view.file.path,
            });
        }
    }

    appMouseMove(evt: MouseEvent) {
        const targetEl = evt.target as HTMLElement;

        // Track mouse position for instant node creation
        this._lastMouseX = evt.clientX;
        this._lastMouseY = evt.clientY;

        this.scalePointer = [];
        this.scalePointer.push(evt.offsetX, evt.offsetY);

        if (targetEl.closest('.mm-node')) {
            var id = targetEl.closest('.mm-node').getAttribute('data-id');
            var node = this.getNodeById(id);
            if (node) {
                var box = node.getBox();
                this.scalePointer = [];
                this.scalePointer.push(box.x + box.width / 2, box.y + box.height / 2);
            }
        }

        // Handle node dragging (or check if we should start dragging)
        if(this._dragNode){
            var x = evt.pageX;
            var y = evt.pageY;

            // Check if we've exceeded the drag threshold
            if(!this._hasDragStarted){
                const deltaX = x - this.startX;
                const deltaY = y - this.startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if(distance > this._dragThreshold){
                    // START the drag now
                    console.log(`[DRAG] Threshold exceeded (${distance.toFixed(1)}px > ${this._dragThreshold}px), starting drag`);
                    this._hasDragStarted = true;
                    this._nodeDragMode = true;
                    this.drag = true;

                    // Add visual feedback for dragging
                    this._dragNode.containEl.classList.add('mm-dragging');
                    this.appEl.classList.add('mm-dragging-active');

                    // Make SVG pass-through during drag
                    const svgElement = this.contentEL.querySelector('svg');
                    if (svgElement) {
                        svgElement.style.pointerEvents = 'none';
                    }

                    console.log(`[DRAG] Node drag STARTED for: ${this._dragNode.data.text}, Mode: ${this._isReparentDrag ? 'REPARENT' : 'POSITION'}`);
                } else {
                    // Haven't moved enough yet - don't do anything
                    return;
                }
            }

            // Account for zoom scale when calculating delta
            const scale = this.mindScale / 100;
            this.dx = (x - this.startX) / scale;
            this.dy = (y - this.startY) / scale;

            // Only process drag logic if drag has actually started
            if(!this._hasDragStarted){
                return;
            }

            // Check if Alt key is still pressed OR forced mode (in case user pressed it during drag)
            if (!this._isReparentDrag && (evt.altKey || evt.metaKey || this._forcedReparentMode)) {
                console.log('[DRAG] Switching to REPARENT mode', {
                    altKey: evt.altKey,
                    metaKey: evt.metaKey,
                    forcedMode: this._forcedReparentMode
                });
                this._isReparentDrag = true;
            } else if (this._isReparentDrag && !evt.altKey && !evt.metaKey && !this._forcedReparentMode && !this._autoReparentFloating) {
                console.log('[DRAG] Switching to POSITION mode');
                this._isReparentDrag = false;
            }

            if(this._isReparentDrag){
                // Alt+drag: Reparenting mode - show drop targets
                console.log('[DRAG] Reparenting mode active');
                // Remove previous drop target highlighting
                this.traverseDF((node: INode) => {
                    node.containEl.classList.remove('mm-drop-target');
                });

                // Find the node under the cursor using manual bounding box check
                // This is more reliable than elementFromPoint with transforms/scaling
                let dropNode: INode = null;

                this.traverseDF((node: INode) => {
                    if (node === this._dragNode) return; // Skip dragged node

                    const rect = node.containEl.getBoundingClientRect();
                    if (evt.clientX >= rect.left && evt.clientX <= rect.right &&
                        evt.clientY >= rect.top && evt.clientY <= rect.bottom) {
                        dropNode = node;
                    }
                });

                console.log('[DRAG] Looking for drop target:', {
                    foundDropNode: !!dropNode,
                    dropNodeText: dropNode?.data.text,
                    mousePos: {x: evt.clientX, y: evt.clientY},
                    allNodesCount: document.querySelectorAll('.mm-node').length
                });

                if(dropNode){
                    console.log('[DRAG] Valid drop target:', dropNode.data.text);

                    var box = dropNode.getBox();
                    // Use clientX/Y for _getDragType since it uses getBoundingClientRect
                    this._dragType = this._getDragType(dropNode, evt.clientX, evt.clientY);
                    this._indicateDom.style.display = 'block';
                    this._indicateDom.style.left = box.x + box.width / 2 - 40 / 2 + 'px';
                    this._indicateDom.style.top = box.y - 90 + 'px';
                    this._indicateDom.className = 'mm-node-layout-indicate';

                    // Highlight the drop target node
                    dropNode.containEl.classList.add('mm-drop-target');
                    this._currentDropTarget = dropNode;

                    if( this._dragType == 'top') {
                        this._indicateDom.classList.add('mm-arrow-top');
                    } else if ( this._dragType == 'down') {
                        this._indicateDom.classList.add('mm-arrow-down');
                    } else if ( this._dragType == 'left') {
                        this._indicateDom.classList.add('mm-arrow-left');
                    } else if ( this._dragType == 'right') {
                        this._indicateDom.classList.add('mm-arrow-right');
                    } else {
                        this._indicateDom.classList.add('drag-type');
                        var arr = this._dragType.split('-');
                        if (arr[1]) {
                            this._indicateDom.classList.add('mm-arrow-' + arr[1]);
                        } else {
                            this._indicateDom.classList.add('mm-arrow-right');
                        }
                    }
                } else {
                    this._indicateDom.style.display = 'none';
                    this._currentDropTarget = null;
                }
            } else {
                // Normal drag: Position mode - move node freely
                const newX = this._dragStartPos.x + this.dx;
                const newY = this._dragStartPos.y + this.dy;

                // Mark as floating and update data immediately so restoreFloatingPositions() works
                this._dragNode.data.isFloating = true;
                this._dragNode.data.floatingX = newX;
                this._dragNode.data.floatingY = newY;

                // Update node position in real-time
                this._dragNode.setPosition(newX, newY);

                // Throttle refresh using requestAnimationFrame to redraw connection lines
                if (!this._rafId) {
                    this._rafId = requestAnimationFrame(() => {
                        this.refresh();
                        this._rafId = null;
                    });
                }

                // Hide reparenting indicators
                this._indicateDom.style.display = 'none';
                this._currentDropTarget = null;
            }
        }
        // Handle canvas panning
        else if(this.drag && !this._nodeDragMode){
            this.containerEL.scrollLeft = this._left - (evt.pageX - this.startX);
            this.containerEL.scrollTop = this._top - (evt.pageY - this.startY);
        }
    }

    appMouseDown(evt:MouseEvent){
        const targetEl = evt.target as HTMLElement;

        // Don't start drag if we're in connection mode - let click handler deal with it
        if (this._connectionMode) {
            console.log('[DRAG] In connection mode - skipping drag setup');
            return;
        }

        // Don't start drag if clicking on collapse button - let click handler deal with it
        if(targetEl.hasClass('mm-node-bar') || targetEl.closest('.mm-node-bar')){
            console.log('[DRAG] Clicked on collapse button - skipping drag');
            return;
        }

        const nodeEl = targetEl.closest('.mm-node');

        console.log('[DRAG] appMouseDown fired', {
            hasNodeEl: !!nodeEl,
            altKey: evt.altKey,
            metaKey: evt.metaKey,
            ctrlKey: evt.ctrlKey,
            shiftKey: evt.shiftKey,
            target: evt.target
        });

        if(nodeEl){
            // ALL nodes are now draggable
            const nodeId = nodeEl.getAttribute('data-id');
            this._dragNode = this.getNodeById(nodeId);

            if (!this._dragNode) {
                console.warn('[DRAG] Node not found for id:', nodeId);
                return;
            }

            // For graph-mode connections, nodes should be freely movable by default
            // Only enter reparent mode when Alt/Cmd is held OR forced mode is enabled
            this._isReparentDrag = evt.altKey || evt.metaKey || this._forcedReparentMode;

            console.log('[DRAG] Drag PREPARED (not started yet):', {
                nodeText: this._dragNode.data.text,
                isReparentDrag: this._isReparentDrag,
                altKey: evt.altKey,
                metaKey: evt.metaKey,
                forcedReparentMode: this._forcedReparentMode,
                isFloating: this._dragNode.data.isFloating,
                hasParent: !!this._dragNode.parent
            });

            // DON'T start drag yet - just prepare for it
            // Drag will start in appMouseMove if movement exceeds threshold
            this._nodeDragMode = false;  // Will be set to true after threshold
            this.drag = false;  // Will be set to true after threshold
            this._hasDragStarted = false;  // Track if we actually start dragging
            this.startX = evt.pageX;
            this.startY = evt.pageY;

            // Store original position for position drag
            const pos = this._dragNode.getPosition();
            this._dragStartPos = {x: pos.x, y: pos.y};

            console.log(`[DRAG] Waiting for movement beyond ${this._dragThreshold}px threshold`);

            evt.preventDefault();
            evt.stopPropagation();
        } else {
            // Start canvas panning mode
            console.log('[DRAG] Canvas panning mode started');
            this.drag = true;
            this.startX = evt.pageX;
            this.startY = evt.pageY;
            this._left = this.containerEL.scrollLeft;
            this._top = this.containerEL.scrollTop;
        }
    }

    appMouseUp(evt:MouseEvent){
        console.log('[DRAG] appMouseUp fired', {
            nodeDragMode: this._nodeDragMode,
            hasDragNode: !!this._dragNode,
            hasDragStarted: this._hasDragStarted,
            dragNodeText: this._dragNode?.data.text,
            isReparentDrag: this._isReparentDrag,
            hasDropTarget: !!this._currentDropTarget,
            dropTargetText: this._currentDropTarget?.data.text,
            dragType: this._dragType
        });

        // If we have a drag node but drag never started (below threshold),
        // just clean up and allow click/double-click to proceed
        if(this._dragNode && !this._hasDragStarted){
            console.log('[DRAG] Drag never started (below threshold) - treating as click/double-click');
            this._dragNode = null;
            this._nodeDragMode = false;
            this._hasDragStarted = false;
            this.drag = false;
            return;  // Let click/double-click handlers work
        }

        // Handle node drop
        if(this._nodeDragMode && this._dragNode){
            if(this._isReparentDrag && this._currentDropTarget){
                // Alt+drag: Reparent the node
                console.log('[DRAG] Executing reparent operation:', {
                    dragNode: this._dragNode.data.text,
                    dropTarget: this._currentDropTarget.data.text,
                    dragType: this._dragType
                });

                if (this._dragNode.data.isRoot) {
                    console.log('Cannot reparent root node');
                    new Notice('Cannot reparent root node');
                    // Restore original position
                    this._dragNode.setPosition(this._dragStartPos.x, this._dragStartPos.y);
                } else {
                    if (evt.ctrlKey || evt.metaKey) {
                        // Ctrl/Cmd key pressed: copy the node
                        console.log('Copying node');
                        let copiedNode = this.copyNode(this._dragNode);
                        this._currentDropTarget.select();
                        this.pasteNode(copiedNode);
                        new Notice(`Copied "${this._dragNode.data.text}"`);
                    } else {
                        // Move the node in hierarchy
                        console.log('Moving node with type:', this._dragType);
                        this.moveNode(this._dragNode, this._currentDropTarget, this._dragType);

                        // Clear floating state after successful reparent
                        if (this._dragNode.data.isFloating) {
                            this._dragNode.data.isFloating = false;
                            delete this._dragNode.data.floatingX;
                            delete this._dragNode.data.floatingY;

                            // Remove from roots array if present
                            const index = this.roots.indexOf(this._dragNode);
                            if (index > -1) {
                                this.roots.splice(index, 1);
                                console.log('[DRAG] Removed floating node from roots array');
                            }
                        }

                        new Notice(`Moved "${this._dragNode.data.text}"`);
                    }
                }
            } else if(!this._isReparentDrag) {
                // Normal drag: Save new floating position
                const pos = this._dragNode.getPosition();
                console.log(`Node positioned at: ${pos.x}, ${pos.y}`);

                // Mark as floating and save position
                this._dragNode.data.isFloating = true;
                this._dragNode.data.floatingX = pos.x;
                this._dragNode.data.floatingY = pos.y;

                this.mindMapChange();
            }
        }

        // Clean up drag state
        if(this._nodeDragMode){
            console.log('Node drag mode ended');
            this._indicateDom.style.display = 'none';
            this._menuDom.style.display = 'none';

            // Cancel any pending animation frame
            if (this._rafId) {
                cancelAnimationFrame(this._rafId);
                this._rafId = null;
            }

            // Final refresh to ensure lines are correctly drawn
            this.refresh();

            // Remove dragging visual feedback
            if (this._dragNode) {
                this._dragNode.containEl.classList.remove('mm-dragging');
            }
            this.appEl.classList.remove('mm-dragging-active');

            // Restore SVG pointer events
            const svgElement = this.contentEL.querySelector('svg');
            if (svgElement) {
                svgElement.style.pointerEvents = 'auto';
            }

            // Remove drop target highlighting from all nodes
            this.traverseDF((node: INode) => {
                node.containEl.classList.remove('mm-drop-target');
            });

            this._currentDropTarget = null;
            this._nodeDragMode = false;
            this._isReparentDrag = false;
            this._autoReparentFloating = false;
            this._dragStartPos = null;
            this._hasDragStarted = false;  // Reset for next drag
        }

        this.drag = false;
        this._dragNode = null;  // Clear drag node reference
    }

    appDblclickFn(evt: MouseEvent) {
        console.log('[DBLCLICK] Double-click detected', evt.target);

        if (!(evt.target instanceof HTMLElement)) {
            console.log('[DBLCLICK] Target is not HTMLElement');
            return;
        }

        console.log('[DBLCLICK] Target is HTMLElement:', evt.target.className);

        if (evt.target.hasClass('mm-node-bar')) {
            console.log('[DBLCLICK] Clicked on collapse bar - ignoring');
            evt.preventDefault();
            evt.stopPropagation();
            return;
        }

        const nodeEl = evt.target.closest('.mm-node');
        console.log('[DBLCLICK] Closest node element:', nodeEl);

        if (nodeEl instanceof HTMLElement) {
            var id = nodeEl.getAttribute('data-id');
            console.log('[DBLCLICK] Node id:', id);
            const node = this.getNodeById(id);
            if (!node) {
                console.warn('[DBLCLICK] Node not found for id:', id);
                return;
            }
            this.selectNode = node;
            console.log('[DBLCLICK] Found node:', node.data.text, 'editNode:', this.editNode?.data.text);
            if (!this.editNode || (this.editNode && this.editNode != this.selectNode)) {
                console.log('[DBLCLICK] Calling edit() on node');
                this.selectNode?.edit();
                this.editNode = this.selectNode;
                this._menuDom.style.display='none';
            } else {
                console.log('[DBLCLICK] Skipping edit - already editing this node');
            }
        } else {
            console.log('[DBLCLICK] Did not find .mm-node parent - you clicked on empty canvas');
            new Notice('💡 Double-click directly on a node box to edit it', 3000);
        }
    }

    appMousewheel(evt: any) {
        // if(!evt) evt = window.event;
        var ctrlKey = evt.ctrlKey || evt.metaKey;
        var delta;
        if (evt.wheelDelta) {
            //IE、chrome  -120
            delta = evt.wheelDelta / 120;
        } else if (evt.detail) {
            //FF 3
            delta = -evt.detail / 3;
        }

        if (delta) {
            if (delta < 0) {
                if (ctrlKey) {
                    this.setScale("down");
                }
            } else {
                if (ctrlKey) {
                    this.setScale("up");
                }
            }
        }
    }

    clearNode() {
        //delete node
        this.traverseBF((n: INode) => {
            this.contentEL.removeChild(n.containEl);
        });

        //delete line
        if (this.mmLayout) {
            this.mmLayout.svgDom?.clear();
        }

    }

    clear() {
        this.clearNode();
        this.removeEvent();
        this.draw?.clear();
    }

    // Add a new root node to the canvas
    addNewRoot(text?: string) {
        const rootIndex = this.roots.length;
        const rootSpacing = 800;
        const startX = this.setting.canvasSize / 2 - 60;
        const startY = this.setting.canvasSize / 2 - 200;

        const newRootData: INodeData = {
            id: uuid(),
            text: text || `New Map ${rootIndex + 1}`,
            children: [],
            isRoot: true,
            expanded: true
        };

        const newRoot = new INode(newRootData, this);
        const x = startX + (rootIndex * rootSpacing);
        const y = startY;

        newRoot.setPosition(x, y);
        newRoot.data.isRoot = true;
        this.roots.push(newRoot);
        this.contentEL.appendChild(newRoot.containEl);
        newRoot.refreshBox();

        this.refresh();
        this.mindMapChange();

        return newRoot;
    }

    // Convert screen coordinates to canvas coordinates
    screenToCanvasCoords(clientX: number, clientY: number): {x: number, y: number} {
        const rect = this.appEl.getBoundingClientRect();
        const scale = this.mindScale / 100;

        // Account for scroll position and zoom scale
        const canvasX = (clientX - rect.left + this.containerEL.scrollLeft) / scale;
        const canvasY = (clientY - rect.top + this.containerEL.scrollTop) / scale;

        return {x: canvasX, y: canvasY};
    }

    // Check if a position collides with any existing node
    checkCollision(x: number, y: number, padding: number = 50): boolean {
        let collision = false;
        this.traverseDF((node: INode) => {
            const pos = node.getPosition();
            const dim = node.getDimensions();

            // Check bounding box collision with padding
            if (x < pos.x + dim.x + padding &&
                x + 200 > pos.x - padding &&  // Assume ~200px width for new node
                y < pos.y + dim.y + padding &&
                y + 60 > pos.y - padding) {   // Assume ~60px height for new node
                collision = true;
            }
        });
        return collision;
    }

    // Find non-overlapping position for new node
    findEmptyPosition(startX: number, startY: number): {x: number, y: number} {
        const spacingX = 300;  // Large horizontal spacing
        const spacingY = 200;  // Large vertical spacing
        const maxAttempts = 20;

        // Try grid positions in a spiral pattern
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const ring = Math.floor(Math.sqrt(attempt));
            const col = (attempt % 4) - 1;  // -1, 0, 1, 2
            const row = Math.floor(attempt / 4);

            const testX = startX + (col * spacingX);
            const testY = startY + (row * spacingY);

            if (!this.checkCollision(testX, testY, 80)) {
                return {x: testX, y: testY};
            }
        }

        // If all attempts fail, just offset far to the right
        return {x: startX + (spacingX * 3), y: startY};
    }

    // Create node at cursor position (instant capture)
    createNodeAtCursor(text: string = '') {
        let coords = this._lastMouseX && this._lastMouseY
            ? this.screenToCanvasCoords(this._lastMouseX, this._lastMouseY)
            : { x: this.setting.canvasSize / 2, y: this.setting.canvasSize / 2 };

        // Check if position is empty, if not find an empty spot
        if (this.checkCollision(coords.x, coords.y)) {
            console.log('[CREATE] Position occupied, finding empty spot...');
            coords = this.findEmptyPosition(coords.x, coords.y);
            console.log('[CREATE] Found empty position at:', coords);
        }

        // Store for next creation
        this._lastCreationPosition = {x: coords.x, y: coords.y};

        // Don't auto-refresh yet - we'll do it after selection
        const node = this.addFloatingNode(text, coords.x, coords.y, false);

        // Select the node BEFORE refresh so selection persists
        this.clearSelectNode();
        this.selectNode = node;
        node.select();

        // Now refresh with the node already selected
        this.refresh();
        this.mindMapChange();

        // Enter edit mode after refresh completes
        setTimeout(() => {
            if (!node.data.isEdit) {
                node.edit();
            }
        }, 100);

        return node;
    }

    // Add a floating node (no parent, custom position)
    addFloatingNode(text: string, x?: number, y?: number, autoRefresh: boolean = true) {
        // Use provided position or canvas center
        const posX = x !== undefined ? x : this.setting.canvasSize / 2;
        const posY = y !== undefined ? y : this.setting.canvasSize / 2;

        const floatingNodeData: INodeData = {
            id: uuid(),
            text: text,
            children: [],
            isRoot: false,
            expanded: true,
            isFloating: true,
            floatingX: posX,
            floatingY: posY
        };

        const floatingNode = new INode(floatingNodeData, this);
        floatingNode.setPosition(posX, posY);
        this.contentEL.appendChild(floatingNode.containEl);
        floatingNode.refreshBox();

        // Add to roots array so it gets traversed (but not marked as isRoot)
        this.roots.push(floatingNode);

        if (autoRefresh) {
            this.refresh();
            this.mindMapChange();
        }

        return floatingNode;
    }

    // Toggle collapse/expand all children of a root node
    toggleCollapseRoot(rootNode: INode) {
        console.log('[COLLAPSE] toggleCollapseRoot called', {
            nodeText: rootNode.data.text,
            isRoot: rootNode.data.isRoot,
            numChildren: rootNode.children.length
        });

        if (!rootNode.data.isRoot) {
            console.log('[COLLAPSE] Node is not a root, returning');
            return;
        }

        // Check if any children are expanded
        let hasExpandedChildren = false;
        rootNode.children.forEach(child => {
            if (child.isExpand) {
                hasExpandedChildren = true;
            }
        });

        console.log('[COLLAPSE] Collapse state:', {
            hasExpandedChildren,
            action: hasExpandedChildren ? 'COLLAPSE ALL' : 'EXPAND ALL'
        });

        // If any are expanded, collapse all; otherwise expand all
        if (hasExpandedChildren) {
            this.collapseAllChildren(rootNode);
        } else {
            this.expandAllChildren(rootNode);
        }

        this.refresh();
        console.log('[COLLAPSE] Refresh complete');
    }

    // Collapse all descendants of a node
    collapseAllChildren(node: INode) {
        console.log('[COLLAPSE] collapseAllChildren called for:', node.data.text);
        let count = 0;
        this.traverseDF((n: INode) => {
            if (n !== node && n.isExpand) {
                console.log('[COLLAPSE] Collapsing:', n.data.text);
                n.collapse();
                count++;
            }
        }, node);
        console.log(`[COLLAPSE] Collapsed ${count} nodes`);
    }

    // Expand all descendants of a node
    expandAllChildren(node: INode) {
        console.log('[COLLAPSE] expandAllChildren called for:', node.data.text);
        let count = 0;
        this.traverseDF((n: INode) => {
            if (!n.isExpand) {
                console.log('[COLLAPSE] Expanding:', n.data.text);
                n.expand();
                count++;
            }
        }, node);
        console.log(`[COLLAPSE] Expanded ${count} nodes`);
    }
    //get node list rect point
    getBoundingRect(list: INode[]) {
        var box = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            right: 0,
            bottom: 0
        };
        list.forEach((item, i) => {
            var b = item.getBox();
           // console.log(b.x,b.y);
            if (i == 0) {
                box.x = b.x;
                box.y = b.y;
                box.right = b.x + b.width;
                box.bottom = b.y + b.height;
            } else {
                if (b.x < box.x) {
                    box.x = b.x
                }
                if (b.y < box.y) {
                    box.y = b.y
                }
                if (b.x + b.width > box.right) {
                    box.right = b.x + b.width;
                }
                if (b.y + b.height > box.bottom) {
                    box.bottom = b.y + b.height;
                }
            }
        });

        box.width = box.right - box.x;
        box.height = box.bottom - box.y;

        return box;
    }

    moveNode(dragNode: INode, dropNode: INode, type:string, setInHistory: boolean = true) {

        if (dragNode == dropNode || dragNode.data.isRoot) {
            return
        }

        var flag = false;
        var p = dropNode.parent;
        while (p) {
            if (p == dragNode) {
                flag = true;
                break;
            }
            p = p.parent;
        }
        if (flag) {  //parent  can not change to child
            return;
        }

        dropNode.clearCacheData();
        dragNode.clearCacheData();

        if (type == 'right' || type == 'left'){
            if (!dropNode.isExpand) {
                dropNode.expand();
            }
        }

        if (type == 'top' || type == 'left' ||type == 'down' || type == 'right') {
            this.execute('moveNode', { type: 'siblings', node: dragNode, oldParent: dragNode.parent, dropNode, direct: type, inHistory: setInHistory})
        }
        else if (type.indexOf('child') > -1) {
            var typeArr = type.split('-');
            if (typeArr[1]) {
                this.execute('moveNode', { type: 'child', node: dragNode, oldParent: dragNode.parent, parent: dropNode, direct: typeArr[1] })
            }
            else {
                this.execute('moveNode', { type: 'child', node: dragNode, oldParent: dragNode.parent, parent: dropNode });
            }
        }

       // this.execute('moveNode', { type: 'child', node: dragNode, oldParent: dragNode.parent, parent: dropNode })
    }


    // Move all the current node's siblings as this node's children
    moveAllSiblingsAsChildren(node: INode) {
        var sibs = node.getSiblings();
        sibs.forEach((sib) => {
            this._moveAsChild(sib, node);
        })

        return;
    }


    // Move the current node's next siblings as this node's children
    moveNextSiblingsAsChildren(node: INode) {
        var sibs = node.getAllNextSiblings();
        sibs.forEach((sib) => {
            this._moveAsChild(sib, node);
        })

        return;
    }


    // Join the current node with the following node
    joinWithFollowingNode(node: INode, in_asCitation: Boolean) {
        let joinedNode = node.getNextSibling();

        // Set node's text, except for the starting emoticon and finishing link (if any)
        const emoticonRegex = /^[\u263a-\u27bf\u{1f300}-\u{1f9ff}]/u;
        // Regex to match links with the link pattern [🔗](...)
        // [🔗] is constant and (...) is any content inside parentheses.
        const linkRegex = /\[🔗\]\(.*\.pdf\)/g;
        const pageRegex = / \(p\. \d+\)$/;
        // Remove the emoticon and links from the text
        let node_text = (node.data.text)
            .replace(linkRegex, "")        // Remove all links of the form [🔗](...)
            .trimEnd()                     // Trim ending whitespace
            .replace(pageRegex, "")        // Remove last page of the form (p. ...)
        let joinedText = joinedNode.data.text
            .replace(emoticonRegex, "")    // Remove starting emoticon
            .trimStart();                  // Trim leading whitespace

        let l_middle_text = " "
        if (in_asCitation)
        { l_middle_text += "(…)"
        }
        l_middle_text += "<br>"
        node.setText(node_text + l_middle_text + joinedText);

        // let joinedText = joinedNode.data.text.replace(emoticonRegex, "").trimStart();
        // node.setText(node.data.text + " (…) " + joinedText);
        // node.setText(node.data.text + " (…) " + joinedNode.data.text);


        if(!joinedNode.isLeaf())
        {// The joined node has children: copy them to the current node
            joinedNode.children.forEach((n) => {
                //this._moveAsChild(n, node);
                let copiedNode = this.copyNode(n);
                this.selectNode.unSelect();
                node.select();
                this.pasteNode(copiedNode);
            });
        }

        // Delete joined node
        this.removeNode(joinedNode);

        this.clearSelectNode();
        this.refresh();
        this.scale(this.mindScale);
        node.select();
    }

    //execute cmd , store history
    execute(name: string, data?: any) {
        return this.exec.execute(name, data);
    }
    undo() {
        this.exec.undo();
        console.log("Undo");
    }

    redo() {
        this.exec.redo();
        console.log("Redo");
    }

    addNode(node: INode, parent?: INode, index = -1) {
        if (parent) {
            parent.addChild(node, index);
            if (parent.direct) {
                node.direct = parent.direct;
            }
            this._addNodeDom(node);
            node.clearCacheData();
        }
    }

    _addNodeDom(node: INode) {
        this.traverseBF((n: INode) => {
            if (!this.contentEL.contains(n.containEl)) {
                this.contentEL.appendChild(n.containEl);
            }
        }, node);
    }

    removeNode(node: INode) {
        if (node.parent) {
            var p = node.parent;
            var i = node.parent.removeChild(node);
            this._removeChildDom(node);
            p.clearCacheData();
            return i;
        } else {
            this._removeChildDom(node);
            return -1;
        }

    }

    _removeChildDom(node: INode) {
        this.traverseBF((n: INode) => {
            if (this.contentEL.contains(n.containEl)) {
                this.contentEL.removeChild(n.containEl);
            }
        }, node);
    }

    //layout
    layout() {
        if (!this.mmLayout) {
            this.mmLayout = new Layout(this.root, this.setting.layoutDirect||'mind map', this.colors);
            // Select and center on the mindmap's root when opening it
            this.root.select();
            this.centerOnNode(this.root);
            // Restore floating positions after initial layout
            this.restoreFloatingPositions();
            // Redraw hierarchical tree connections
            this.mmLayout.createLink();
            // Draw many-to-many graph connections
            this.renderConnections();
            return;
        }

        this.mmLayout.layout(this.root, this.setting.layoutDirect || this.mmLayout.direct || 'mind map');

        // After layout calculation, restore floating node positions
        this.restoreFloatingPositions();

        // Redraw hierarchical tree connection lines now that nodes are in their final positions
        this.mmLayout.createLink();

        // Draw many-to-many graph connections on top
        this.renderConnections();
    }

    // Restore custom positions for floating nodes (overrides layout calculation)
    restoreFloatingPositions() {
        this.traverseDF((node: INode) => {
            if (node.data.isFloating && node.data.floatingX !== undefined && node.data.floatingY !== undefined) {
                node.setPosition(node.data.floatingX, node.data.floatingY);
            }
        });
    }

    refresh() {
        this.layout();
    }

    emit(name: string, data?: any) {
        var evt = new CustomEvent(name, {
            detail: data || {}
        });
        this.appEl.dispatchEvent(evt);
    }

    on(name: string, fn: any) {
        this.appEl.addEventListener(name, fn);
    }

    off(name: string, fn: any) {
        if (name && fn) {
            this.appEl.removeEventListener(name, fn);
        }
    }

    center() {
        //console.log("Center mindmap")
        this._setMindScalePointer(this.root);
        var oldScale = this.mindScale;
        this.scale(100);

        var w = this.containerEL.clientWidth;
        var h = this.containerEL.clientHeight;
        this.containerEL.scrollTop = this.setting.canvasSize / 2 - h / 2 - 60;
        this.containerEL.scrollLeft = this.setting.canvasSize / 2 - w / 2 + 30;

        this.scale(oldScale);
    }


    centerOnNode(node: INode) {
        if(node == null)
        {//No node given as input argument
            this.center();
        } else {
            //console.log("Center mindmap on node "+node.getId())
            this._setMindScalePointer(node);
            var oldScale = this.mindScale;
            this.scale(100);

            var w = this.containerEL.clientWidth;
            var h = this.containerEL.clientHeight;
            let pos_x = node.getPosition().x;
            let pos_y = node.getPosition().y;
            let dim_x = node.getDimensions().x;
            let dim_y = node.getDimensions().y;
            //this.containerEL.scrollTop = this.setting.canvasSize / 2 - h / 2 - 60 ;
            //this.containerEL.scrollLeft = this.setting.canvasSize / 2 - w / 2 + 30 ;
            this.containerEL.scrollTop  = pos_y - (h/2 - dim_y/2) + 90;
            //this.containerEL.scrollLeft = pos_x - (w/2 - dim_x/2) + 40;
            this.containerEL.scrollLeft = pos_x - (w/2 - dim_x/2) + 200;

            this.scale(oldScale);
        }
    }


    // Count all descendants of a node (for delete confirmation)
    countDescendants(node: INode): number {
        let count = 0;
        const countRecursive = (n: INode) => {
            if (n.children && n.children.length > 0) {
                count += n.children.length;
                n.children.forEach(child => countRecursive(child));
            }
        };
        countRecursive(node);
        return count;
    }

    _resetMaxDisplayedLevel() {
        this.dispLevel = 0;
        return;
    }


    _getMaxDisplayedLevel(node: INode)
    {// Returns the highest displayed level.
     // Use getMaxDisplayedLevel (without _).
        if( (node.getLevel() > tempDispLevel)   &&
            (node.isShow())                     )
        {// Displayed node with higher level
            tempDispLevel = node.getLevel();
        }

        if(!node.isLeaf())
        {// The node has children
            node.children.forEach((n) => {
                this._getMaxDisplayedLevel(n);
            });
        }

        return;
    }


    getMaxDisplayedLevel()
    {// Returns the highest displayed level.
        tempDispLevel = 0;
        this._getMaxDisplayedLevel(this.root);
        this.dispLevel = tempDispLevel;

        return this.dispLevel;
    }


    getMaxNodeDisplayedLevel(node: INode)
    {// Returns the highest displayed level.
        tempDispLevel = 0;
        this._getMaxDisplayedLevel(node);

        return tempDispLevel;
    }


    _setDisplayedLevel(node: INode, level:number)
    {// Display nodes whose level is <= number
        var currentLevel = 0;

        if( (node.getLevel()<level) )
        {// Current level is to be displayed
            node.expand();
            if(!node.isLeaf())
            {// The node has children
                node.children.forEach((n) => {
                    this._setDisplayedLevel(n, level);
                });
            }
        }
        else{
            node.collapse();
        }

        return;
    }


    setDisplayedLevel(level:number)
    {// Display nodes whose level is <= number
        var currentLevel = 0;

        if(level>0) {
            var minLevel = 0;

            this.root.expand();
            this.root.children.forEach((n) => {
                this._setDisplayedLevel(n, level);
            });
        }
        else
        {
            this.root.collapse();
        }

        return;
    }


    setChildrenDisplayedLevel(level:number)
    {// Display children nodes whose level is <= number
        var currentLevel = 0;
        let node = this.selectNode;

        if(level>0 && node) {
            var minLevel = 0;

            if(node.getLevel() == level)
            {// Max required displayed level is node level
                node.mindmap.execute('collapseNode', {
                    node
                });
            }
            else
            {// Expand to required level
                node.expand();
                node.children.forEach((n) => {
                    this._setDisplayedLevel(n, level);
                });
            }
        }
        else
        {
            this.root.collapse();
        }

        this.scale(this.mindScale);

        return;
    }

    _setMindScalePointer(node: INode) {
        this.scalePointer = [];
        // var root = this.root;
        if (node) {
            var rbox = node.getBox();
            this.scalePointer.push(rbox.x + rbox.width / 2, rbox.y + rbox.height / 2);
            if(!node.isSelect){
                this.clearSelectNode();
                node.select();
            }
        }
    }

    getMarkdown() {
        var md = '';
        var level = this.setting.headLevel;

        // Traverse all roots (including floating nodes) instead of just this.root
        this.traverseDF((n: INode) => {
            var l = n.getLevel() + 1;
            var hPrefix = '', space = '';
            if (l > 1) {
                hPrefix = '\n';
            }
            const ending = n.isExpand ? '' : ` ^${n.getId()}`
            if (n.getLevel() < level) {
                for (let i = 0; i < l; i++) {
                    hPrefix += '#';
                }
                md += (hPrefix + ' ');
                md += n.getData().text.trim() + ending + '\n';

            } else {
                for (var i = 0; i < n.getLevel() - level; i++) {
                    space += '\t';
                }
                var text = n.getData().text.trim();
                if (text) {
                    var textArr = text.split('\n');
                    var lineLength = textArr.length;

                    if (lineLength == 1) {
                        md += `${space}- ${text}${ending}\n`;
                    } else if (lineLength > 1) {
                        //code
                        if (text.startsWith('```')) {
                            md+='\n'
                            md += `${space}-\n`;
                            textArr.forEach((t: string, i: number) => {
                                md += `${space}  ${t.trim()}${i === textArr.length - 1 ? ending : '' }\n`
                            });
                            md+='\n'
                        } else {
                            //text
                            md += `${space}- `;
                            textArr.forEach((t: string, i: number) => {
                                var contentText = "void";
                                if(t.trim().length > 0){
                                    contentText = t.trim();
                                }
                                if (i > 0) {
                                    md += `${space}${contentText}${i === textArr.length - 1 ? ending : '' }\n`
                                } else {
                                    md += `${contentText}\n`
                                }
                            });
                        }

                    }
                } else {
                    for (var i = 0; i < n.getLevel() - level; i++) {
                        space += '   ';
                    }
                    md += `${space}-\n`;
                }
            }
        }, undefined, true);  // Pass undefined to traverse ALL roots (including floating nodes)
        return md.trim();
    }
    scale(num: number) {
        if (num < 20) {
            num = 20;
        }
        if (num > 300) {
            num = 300;
        }
        this.mindScale = num;
        if (this.scalePointer.length) {
            this.appEl.style.transformOrigin = `${this.scalePointer[0]}px ${this.scalePointer[1]}px`;
            this.appEl.style.transform = "scale(" + this.mindScale / 100 + ")";
        } else {
            this.appEl.style.transform = "scale(" + this.mindScale / 100 + ")";
        }

    }

    setScale(type: string) {
        if (type == "up") {
            var n = this.mindScale + 10;
        } else {
            var n = this.mindScale - 10;
        }
        this.scale(n);

        if (this.timeOut) {
            clearTimeout(this.timeOut)
        }

        this.timeOut = setTimeout(() => {
            new Notice(`${n} %`);
        }, 600);
    }

    copyNode(node?:any){
        var n = node||this.selectNode;
        if(n){
           var data:any = [];
           function copyNode(n:INode, pid:any) {
                  var d = n.getData();
                  d.id = uuid();
                  d.pid = pid;
                  data.push({
                      id:d.id,
                      text:d.text,
                      pid:pid,
                      isExpand:d.isExpand,
                      note:d.note
                  });
                  n.children.forEach((c) => {
                     copyNode(c, d.id);
                  });
          }

           copyNode(n,null)

           var _data = {
               type:'copyNode',
               text:data
           };

           return JSON.stringify(_data);

        }else{
            return ''
        }
  }

  pasteNode(text:string){
        var node = this.selectNode;
        if(text){
            try{
                  var json =JSON.parse(text);
                  if(json.type&&json.type=='copyNode'){
                    var data = json.text;
                    if(!node.isExpand){
                       node.expand();
                       node.clearCacheData();
                    }
                   this.execute('pasteNode',{
                       node:node,
                       data:data
                   })

                   navigator.clipboard.writeText('');
                  }
            }catch(err){
                console.log(err)
            }
        }

  }

    // ========== CONNECTION MANAGEMENT (Many-to-Many Graph Support) ==========

    // Find node by ID across all roots
    findNodeById(nodeId: string): INode | null {
        let found: INode | null = null;

        this.traverseDF((node: INode) => {
            if (node.getId() === nodeId) {
                found = node;
                return false; // Stop traversal
            }
        });

        return found;
    }

    // Create a connection between two nodes
    createConnection(sourceNodeId: string, targetNodeId: string, type: import('./INode').ConnectionType, label?: string, bidirectional: boolean = false) {
        const sourceNode = this.findNodeById(sourceNodeId);
        const targetNode = this.findNodeById(targetNodeId);

        if (!sourceNode || !targetNode) {
            new Notice('Cannot create connection: node not found');
            return null;
        }

        // Add connection to source node
        const connection = sourceNode.addConnection(targetNodeId, type, label, bidirectional);

        // If bidirectional, add reverse connection
        if (bidirectional) {
            targetNode.addConnection(sourceNodeId, type, label, true);
        }

        // Redraw connections
        this.refresh();
        this.mindMapChange();

        // Show success notice
        let message = `Connection created: ${type}`;
        if (label) {
            message += ` ("${label}")`;
        }
        if (bidirectional) {
            message += ' (bidirectional)';
        }
        new Notice(message);
        return connection;
    }

    // Remove a connection
    removeConnection(connectionId: string) {
        let removed = false;

        this.traverseDF((node: INode) => {
            if (node.removeConnection(connectionId)) {
                removed = true;
                return false; // Stop traversal
            }
        });

        if (removed) {
            this.refresh();
            this.mindMapChange();
            new Notice('Connection removed');
        }

        return removed;
    }

    // Remove all connections between two nodes
    removeConnectionsBetween(nodeId1: string, nodeId2: string) {
        const node1 = this.findNodeById(nodeId1);
        const node2 = this.findNodeById(nodeId2);

        if (!node1 || !node2) return 0;

        let count = 0;
        count += node1.removeConnectionsTo(nodeId2);
        count += node2.removeConnectionsTo(nodeId1);

        if (count > 0) {
            this.refresh();
            this.mindMapChange();
            new Notice(`${count} connection(s) removed`);
        }

        return count;
    }

    // Draw all non-hierarchical connections
    renderConnections() {
        if (!this.connectionGroup) return;

        // Clear existing connection lines
        this.connectionGroup.clear();

        // Iterate through all nodes and draw their connections
        this.traverseDF((node: INode) => {
            const connections = node.getConnections();

            connections.forEach(conn => {
                const targetNode = this.findNodeById(conn.targetId);
                if (!targetNode) return;

                // Get positions
                const sourcePos = node.getPosition();
                const sourceDim = node.getDimensions();
                const targetPos = targetNode.getPosition();
                const targetDim = targetNode.getDimensions();

                // Calculate center points
                const x1 = sourcePos.x + sourceDim.x / 2;
                const y1 = sourcePos.y + sourceDim.y / 2;
                const x2 = targetPos.x + targetDim.x / 2;
                const y2 = targetPos.y + targetDim.y / 2;

                // Draw connection line
                const color = this.getConnectionColor(conn.type);
                const line = this.connectionGroup.line(x1, y1, x2, y2)
                    .stroke({
                        width: 2,
                        color: color,
                        opacity: 0.6,
                        dasharray: this.getConnectionDash(conn.type)
                    })
                    .addClass('mm-connection-line')
                    .attr('data-connection-id', conn.id)
                    .attr('data-connection-type', conn.type);

                // Add arrow marker if not bidirectional
                if (!conn.bidirectional) {
                    line.marker('end', 8, 8, function(add: any) {
                        add.polygon('0,0 8,4 0,8').fill(color);
                    });
                }

                // Add label if exists
                if (conn.label) {
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    this.connectionGroup.text(conn.label)
                        .move(midX, midY)
                        .font({ size: 12, fill: color })
                        .addClass('mm-connection-label');
                }

                // Make clickable for editing/deletion
                line.node.style.cursor = 'pointer';
                line.node.addEventListener('click', (e: MouseEvent) => {
                    e.stopPropagation();
                    this.handleConnectionClick(conn);
                });
            });
        });
    }

    // Get color for connection type
    getConnectionColor(type: import('./INode').ConnectionType): string {
        const colors: Record<string, string> = {
            'parent-child': '#666',
            'reference': '#4a9eff',
            'related': '#9b59b6',
            'causes': '#e74c3c',
            'contradicts': '#c0392b',
            'supports': '#27ae60',
            'depends-on': '#f39c12',
            'similar-to': '#16a085',
            'custom': '#95a5a6'
        };
        return colors[type] || '#666';
    }

    // Get dash pattern for connection type
    getConnectionDash(type: import('./INode').ConnectionType): string {
        if (type === 'reference' || type === 'related') {
            return '5,5'; // Dashed for non-structural connections
        }
        return ''; // Solid line
    }

    // Handle connection click (for editing/deletion)
    handleConnectionClick(connection: import('./INode').IConnection) {
        // Show context menu for connection
        console.log('Connection clicked:', connection);

        // For now, just allow deletion
        if (confirm(`Delete this ${connection.type} connection?`)) {
            this.removeConnection(connection.id);
        }
    }

    // Enter connection creation mode
    startConnectionMode(sourceNode: INode) {
        console.log('[CONNECTION] startConnectionMode called', {
            sourceNode: sourceNode.data.text,
            currentMode: this._connectionMode
        });
        this._connectionMode = true;
        this._connectionSourceNode = sourceNode;
        this.appEl.style.cursor = 'crosshair';

        // Visual feedback
        sourceNode.containEl.classList.add('mm-connection-source');
        console.log('[CONNECTION] Connection mode activated, cursor:', this.appEl.style.cursor);
        new Notice('Click target node to create connection. Press ESC to cancel.');
    }

    // Exit connection mode
    exitConnectionMode() {
        console.log('[CONNECTION] exitConnectionMode called');
        this._connectionMode = false;
        if (this._connectionSourceNode) {
            this._connectionSourceNode.containEl.classList.remove('mm-connection-source');
        }
        this._connectionSourceNode = null;
        this.appEl.style.cursor = '';
    }

    // Handle node click in connection mode
    handleConnectionModeClick(targetNode: INode) {
        if (!this._connectionMode || !this._connectionSourceNode) return;

        if (this._connectionSourceNode === targetNode) {
            new Notice('Cannot connect node to itself');
            this.exitConnectionMode();
            return;
        }

        // Check if app is available for modal
        if (!this.app) {
            console.error('[CONNECTION] No app instance - cannot show modal');
            new Notice('Connection creation unavailable (no app context)');
            this.exitConnectionMode();
            return;
        }

        // Show modal to select connection type
        const sourceNode = this._connectionSourceNode;
        this.exitConnectionMode(); // Exit mode first so cursor returns to normal

        new ConnectionTypeModal(this.app, (type, label, bidirectional) => {
            this.createConnection(
                sourceNode.getId(),
                targetNode.getId(),
                type,
                label,
                bidirectional
            );
        }).open();
    }

}
