<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-tags"></i> Gérer les tags : {{ noteTitle }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <div class="modal-body">
          <TagSelector 
            :noteId="noteId"
            v-model="selectedTags"
            @update:modelValue="handleTagsUpdate"
          />
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TagSelector from './TagSelector.vue'

export default {
  name: 'TagSelectorModal',
  components: {
    TagSelector
  },
  props: {
    noteId: {
      type: [String, Number],
      required: true
    },
    noteTitle: {
      type: String,
      default: 'Note'
    }
  },
  data() {
    return {
      selectedTags: []
    }
  },
  methods: {
    handleTagsUpdate(tags) {
      this.selectedTags = tags
      this.$emit('tags-updated', tags)
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1055;
}
</style>