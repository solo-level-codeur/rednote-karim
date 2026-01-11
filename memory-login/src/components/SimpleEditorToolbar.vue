<template>
  <div class="simple-toolbar">
    
    <!-- Formatage de base -->
    <div class="toolbar-section">
      <button 
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ active: editor?.isActive('bold') }"
        title="Gras (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      
      <button 
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ active: editor?.isActive('italic') }"
        title="Italique (Ctrl+I)"
      >
        <em>I</em>
      </button>
      
      <button 
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ active: editor?.isActive('underline') }"
        title="Souligné (Ctrl+U)"
      >
        <u>U</u>
      </button>
      
      <button 
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ active: editor?.isActive('strike') }"
        title="Barré"
      >
        <s>S</s>
      </button>
    </div>

    <!-- Séparateur -->
    <div class="separator"></div>

    <!-- Titres -->
    <div class="toolbar-section">
      <select @change="setHeading" class="heading-select">
        <option value="">Paragraphe</option>
        <option value="1">Titre 1</option>
        <option value="2">Titre 2</option>
        <option value="3">Titre 3</option>
      </select>
    </div>

    <!-- Séparateur -->
    <div class="separator"></div>

    <!-- Listes -->
    <div class="toolbar-section">
      <button 
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ active: editor?.isActive('bulletList') }"
        title="Liste à puces"
      >
        • Liste
      </button>
      
      <button 
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ active: editor?.isActive('orderedList') }"
        title="Liste numérotée"
      >
        1. Liste
      </button>
    </div>

    <!-- Séparateur -->
    <div class="separator"></div>

    <!-- Alignement -->
    <div class="toolbar-section">
      <button 
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ active: editor?.isActive({ textAlign: 'left' }) }"
        title="Aligner à gauche"
      >
        ←
      </button>
      
      <button 
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ active: editor?.isActive({ textAlign: 'center' }) }"
        title="Centrer"
      >
        ↔
      </button>
      
      <button 
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ active: editor?.isActive({ textAlign: 'right' }) }"
        title="Aligner à droite"
      >
        →
      </button>
    </div>

    <!-- Séparateur -->
    <div class="separator"></div>

    <!-- Couleurs (simplifié) -->
    <div class="toolbar-section">
      <div class="color-group">
        <label title="Couleur du texte">
          🎨
          <input 
            type="color" 
            @change="setTextColor" 
            value="#000000"
          />
        </label>
        
        <label title="Surlignage">
          🖍️
          <input 
            type="color" 
            @change="setHighlight" 
            value="#ffff00"
          />
        </label>
      </div>
    </div>

    <!-- Séparateur -->
    <div class="separator"></div>

    <!-- Actions rapides -->
    <div class="toolbar-section">
      <button 
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ active: editor?.isActive('blockquote') }"
        title="Citation"
      >
        " Citation
      </button>
      
      <button 
        @click="editor.chain().focus().toggleCode().run()"
        :class="{ active: editor?.isActive('code') }"
        title="Code en ligne"
      >
        &lt;/&gt;
      </button>
    </div>

  </div>
</template>

<script>
export default {
  name: 'SimpleEditorToolbar',
  props: {
    editor: {
      type: Object,
      required: true
    }
  },
  methods: {
    setHeading(event) {
      const level = parseInt(event.target.value)
      if (level) {
        this.editor.chain().focus().toggleHeading({ level }).run()
      } else {
        this.editor.chain().focus().setParagraph().run()
      }
      // Reset select
      event.target.value = ''
    },
    
    setTextColor(event) {
      this.editor.chain().focus().setColor(event.target.value).run()
    },
    
    setHighlight(event) {
      this.editor.chain().focus().toggleHighlight({ color: event.target.value }).run()
    }
  }
}
</script>

<style scoped>
.simple-toolbar {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border-radius: 8px 8px 0 0;
}

.toolbar-section {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px;
  background: rgba(255,255,255,0.5);
  border-radius: 6px;
}

.separator {
  width: 1px;
  height: 24px;
  background: #dee2e6;
  margin: 0 4px;
}

/* Boutons */
button {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 36px;
}

button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

button.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
  box-shadow: 0 2px 4px rgba(0,123,255,0.3);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Select pour les titres */
.heading-select {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  min-width: 120px;
}

.heading-select:hover {
  background: #e9ecef;
}

/* Couleurs */
.color-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.color-group label:hover {
  background: rgba(0,0,0,0.05);
}

.color-group input[type="color"] {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .simple-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-section {
    justify-content: center;
  }
  
  .separator {
    display: none;
  }
}

@media (max-width: 480px) {
  .toolbar-section {
    flex-wrap: wrap;
  }
  
  button {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 32px;
  }
  
  .heading-select {
    min-width: 100px;
    font-size: 12px;
  }
}
</style>