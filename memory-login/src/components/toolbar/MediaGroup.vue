<template>
  <div class="toolbar-group">
    <button 
      @click="addLink"
      :class="{ 'active': editor && editor.isActive('link') }"
      title="Ajouter un lien"
    >
      🔗 Lien
    </button>
    
    <button @click="openImageDialog" title="Ajouter une image">
      📷 Image
    </button>
    <input 
      ref="imageInput"
      type="file" 
      accept="image/*" 
      @change="addImage"
      style="display: none"
    />
    
    <button 
      @click="addYouTube"
      title="Ajouter vidéo YouTube"
    >
      📺 Vidéo
    </button>
  </div>
</template>

<script>
export default {
  name: 'MediaGroup',
  props: {
    editor: {
      type: Object,
      required: true
    }
  },
  methods: {
    // Ajouter un lien
    addLink() {
      const url = prompt('Entrez l\'URL du lien :')
      if (url) {
        this.editor.chain().focus().setLink({ href: url }).run()
      }
    },
    
    // Ouvrir le dialogue d'image
    openImageDialog() {
      this.$refs.imageInput.click()
    },
    
    // Ajouter une image
    addImage(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.editor.chain().focus().setImage({ src: e.target.result }).run()
        }
        reader.readAsDataURL(file)
      }
      // Reset l'input pour permettre de sélectionner la même image
      event.target.value = ''
    },
    
    // Ajouter une vidéo YouTube
    addYouTube() {
      const url = prompt('Entrez l\'URL YouTube :')
      if (url) {
        this.editor.commands.setYoutubeVideo({
          src: url,
          width: 640,
          height: 480,
        })
      }
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