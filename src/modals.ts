import { Modal, Setting } from 'obsidian';
import { ConnectionType } from './mindmap/INode';

// Text Input Modal for floating node creation
export class TextInputModal extends Modal {
  result: string;
  onSubmit: (result: string) => void;
  placeholder: string;

  constructor(app: any, placeholder: string, onSubmit: (result: string) => void) {
    super(app);
    this.placeholder = placeholder;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h3", { text: "Create Floating Node" });

    new Setting(contentEl)
      .setName("Node text")
      .addText((text) =>
        text
          .setPlaceholder(this.placeholder)
          .onChange((value) => {
            this.result = value;
          })
          .inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.close();
              if (this.result && this.result.trim()) {
                this.onSubmit(this.result.trim());
              }
            }
          })
      );

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Create")
          .setCta()
          .onClick(() => {
            this.close();
            if (this.result && this.result.trim()) {
              this.onSubmit(this.result.trim());
            }
          }))
      .addButton((btn) =>
        btn
          .setButtonText("Cancel")
          .onClick(() => {
            this.close();
          }));

    // Focus the input field
    setTimeout(() => {
      const inputEl = contentEl.querySelector('input');
      if (inputEl) {
        inputEl.focus();
      }
    }, 10);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// Connection Type Selector Modal
export class ConnectionTypeModal extends Modal {
  connectionType: ConnectionType = ConnectionType.REFERENCE;
  label: string = '';
  bidirectional: boolean = false;
  onSubmit: (type: ConnectionType, label?: string, bidirectional?: boolean) => void;

  constructor(app: any, onSubmit: (type: ConnectionType, label?: string, bidirectional?: boolean) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h3", { text: "Create Connection" });

    // Connection Type Dropdown
    new Setting(contentEl)
      .setName("Connection type")
      .setDesc("Select the type of relationship")
      .addDropdown((dropdown) => {
        dropdown
          .addOption(ConnectionType.REFERENCE, "Reference (link to related idea)")
          .addOption(ConnectionType.RELATED, "Related (similar concept)")
          .addOption(ConnectionType.CAUSES, "Causes (causal relationship)")
          .addOption(ConnectionType.CONTRADICTS, "Contradicts (opposing idea)")
          .addOption(ConnectionType.SUPPORTS, "Supports (supporting evidence)")
          .addOption(ConnectionType.DEPENDS_ON, "Depends On (dependency)")
          .addOption(ConnectionType.SIMILAR_TO, "Similar To (analogous)")
          .addOption(ConnectionType.CUSTOM, "Custom (user-defined)")
          .setValue(this.connectionType)
          .onChange((value) => {
            this.connectionType = value as ConnectionType;
          });
      });

    // Label Input
    new Setting(contentEl)
      .setName("Label (optional)")
      .setDesc("Add a label to describe the connection")
      .addText((text) =>
        text
          .setPlaceholder("e.g., 'leads to', 'inspired by'")
          .onChange((value) => {
            this.label = value;
          })
      );

    // Bidirectional Checkbox
    new Setting(contentEl)
      .setName("Bidirectional")
      .setDesc("Create a two-way connection")
      .addToggle((toggle) =>
        toggle
          .setValue(this.bidirectional)
          .onChange((value) => {
            this.bidirectional = value;
          })
      );

    // Buttons
    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Create Connection")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(
              this.connectionType,
              this.label.trim() || undefined,
              this.bidirectional
            );
          }))
      .addButton((btn) =>
        btn
          .setButtonText("Cancel")
          .onClick(() => {
            this.close();
          }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

// Edit Connection Modal
export class EditConnectionModal extends Modal {
  connectionType: ConnectionType;
  label: string;
  bidirectional: boolean;
  connection: any;
  onSave: (type: ConnectionType, label?: string, bidirectional?: boolean) => void;
  onDelete: () => void;

  constructor(
    app: any,
    connection: any,
    onSave: (type: ConnectionType, label?: string, bidirectional?: boolean) => void,
    onDelete: () => void
  ) {
    super(app);
    this.connection = connection;
    this.connectionType = connection.type;
    this.label = connection.label || '';
    this.bidirectional = connection.bidirectional || false;
    this.onSave = onSave;
    this.onDelete = onDelete;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h3", { text: "Edit Connection" });

    // Connection Type Dropdown
    new Setting(contentEl)
      .setName("Connection type")
      .setDesc("Select the type of relationship")
      .addDropdown((dropdown) => {
        dropdown
          .addOption(ConnectionType.REFERENCE, "Reference (link to related idea)")
          .addOption(ConnectionType.RELATED, "Related (similar concept)")
          .addOption(ConnectionType.CAUSES, "Causes (causal relationship)")
          .addOption(ConnectionType.CONTRADICTS, "Contradicts (opposing idea)")
          .addOption(ConnectionType.SUPPORTS, "Supports (supporting evidence)")
          .addOption(ConnectionType.DEPENDS_ON, "Depends On (dependency)")
          .addOption(ConnectionType.SIMILAR_TO, "Similar To (analogous)")
          .addOption(ConnectionType.CUSTOM, "Custom (user-defined)")
          .setValue(this.connectionType)
          .onChange((value) => {
            this.connectionType = value as ConnectionType;
          });
      });

    // Label Input
    new Setting(contentEl)
      .setName("Label (optional)")
      .setDesc("Add a label to describe the connection")
      .addText((text) =>
        text
          .setPlaceholder("e.g., 'leads to', 'inspired by'")
          .setValue(this.label)
          .onChange((value) => {
            this.label = value;
          })
      );

    // Bidirectional Checkbox
    new Setting(contentEl)
      .setName("Bidirectional")
      .setDesc("Create a two-way connection")
      .addToggle((toggle) =>
        toggle
          .setValue(this.bidirectional)
          .onChange((value) => {
            this.bidirectional = value;
          })
      );

    // Buttons
    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Save")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSave(
              this.connectionType,
              this.label.trim() || undefined,
              this.bidirectional
            );
          }))
      .addButton((btn) =>
        btn
          .setButtonText("Delete")
          .setWarning()
          .onClick(() => {
            if (confirm(`Delete this ${this.connection.type} connection?`)) {
              this.close();
              this.onDelete();
            }
          }))
      .addButton((btn) =>
        btn
          .setButtonText("Cancel")
          .onClick(() => {
            this.close();
          }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
