<template>
  <div class="toolbar-group">
    <button 
      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      :class="{ 'active': editor && editor.isActive('heading', { level: 1 }) }"
      title="Titre 1"
    >
      H1
    </button>
    
    <button 
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      :class="{ 'active': editor && editor.isActive('heading', { level: 2 }) }"
      title="Titre 2"
    >
      H2
    </button>
    
    <button 
      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      :class="{ 'active': editor && editor.isActive('heading', { level: 3 }) }"
      title="Titre 3"
    >
      H3
    </button>
  </div>
</template>

<script>
export default {
  name: 'HeadingGroup',
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