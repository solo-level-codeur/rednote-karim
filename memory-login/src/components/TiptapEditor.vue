<template>
  <div class="editor-container">
    
    <SimpleEditorToolbar :editor="editor" />
    
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import YouTube from '@tiptap/extension-youtube'
import SimpleEditorToolbar from './SimpleEditorToolbar.vue'

export default {
  name: 'CompleteEditor',
  
  components: {
    EditorContent,
    SimpleEditorToolbar
  },
  
  props: {
    modelValue: {
      type: String,
      default: '<p>Commencez à écrire votre contenu...</p>'
    }
  },
  
  emits: ['update:modelValue'],
  
  data() {
    return {
      editor: null
    }
  },
  
  watch: {
    modelValue(newValue) {
      if (this.editor && this.editor.getHTML() !== newValue) {
        this.editor.commands.setContent(newValue, false)
      }
    }
  },
  
  mounted() {
    this.editor = new Editor({
      content: this.modelValue,
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        Color,
        Highlight.configure({
          multicolor: true
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Link.configure({
          openOnClick: false,
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        YouTube.configure({
          width: 640,
          height: 480,
        }),
      ],
      onUpdate: () => {
        this.$emit('update:modelValue', this.editor.getHTML())
      }
    })
  },
  
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  
}
</script>

<style scoped>
.editor-container {
  border: 1px solid #ddd;
}

.editor-content {
  min-height: 400px;
}

.editor-content :deep(.ProseMirror) {
  padding: 20px;
  outline: none;
}

.editor-content :deep(.ProseMirror h1, .ProseMirror h2, .ProseMirror h3) {
  font-weight: bold;
}

.editor-content :deep(.ProseMirror ul, .ProseMirror ol) {
  padding-left: 20px;
}

.editor-content :deep(.ProseMirror blockquote) {
  border-left: 3px solid #ddd;
  padding: 10px;
  background: #f5f5f5;
}

.editor-content :deep(.ProseMirror pre, .ProseMirror code) {
  background: #f5f5f5;
  font-family: monospace;
}

.editor-content :deep(.ProseMirror pre) {
  padding: 10px;
}

.editor-content :deep(.ProseMirror code) {
  padding: 2px 4px;
}

.editor-content :deep(.ProseMirror img) {
  max-width: 100%;
}
</style>