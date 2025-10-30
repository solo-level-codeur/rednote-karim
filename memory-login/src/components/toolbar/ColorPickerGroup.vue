<!-- ============================================ -->
<!-- GROUPE 2: COULEURS - À extraire en ColorPickerGroup.vue -->
<!-- Responsabilité: Couleur du texte + Surlignage -->
<!-- Props: { editor } | Events: aucun -->
<!-- ============================================ -->
<template>
<div class="toolbar-group">
        <div class="color-picker">
          <span>🎨</span>
          <input 
            type="color" 
            @change="setTextColor" 
            value="#000000"
            title="Couleur du texte"
          />
        </div>
        
        <div class="color-picker">
          <span>🖍️</span>
          <input 
            type="color" 
            @change="setHighlight" 
            value="#ffff00"
            title="Surlignage"
          />
        </div>
      </div>

</template>
<script>
export default {
  name: 'ColorPickerGroup',
  props: {
    editor: {
      type: Object,
      required: true
    }
  },
  methods: {
    // Couleur du texte
    setTextColor(event) {
      this.editor.chain().focus().setColor(event.target.value).run()
    },
    
    // Surlignage
    setHighlight(event) {
      this.editor.chain().focus().toggleHighlight({ color: event.target.value }).run()
    }
  }
}
</script>

<style scoped>
/* Sélecteurs de couleur */
.color-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.color-picker:hover {
  background: #e9ecef;
}

.color-picker input[type="color"] {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

</style>
      
