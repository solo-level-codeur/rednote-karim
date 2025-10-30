<template>
  <div class="toolbar-group">
    <button 
      @click="editor.chain().focus().setTextAlign('left').run()"
      title="Aligner à gauche"
    >
      ←
    </button>
    
    <button 
      @click="editor.chain().focus().setTextAlign('center').run()"
      title="Centrer"
    >
      ↔
    </button>
    
    <button 
      @click="editor.chain().focus().setTextAlign('right').run()"
      title="Aligner à droite"
    >
      →
    </button>
  </div>
</template>

<script>
export default {
  name: 'AlignmentGroup',
  props: {
    editor: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.toolbar-group {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px;
  background: rgba(255,255,255,0.5);
  border-radius: 6px;
}

button {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
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
</style>