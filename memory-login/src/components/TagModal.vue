<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ tag ? 'Modifier le tag' : 'Nouveau tag' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('cancel')"></button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="tagName" class="form-label">Nom du tag *</label>
              <input 
                type="text" 
                class="form-control" 
                id="tagName"
                v-model="formData.name"
                required
                maxlength="50"
                placeholder="Nom du tag..."
              >
            </div>
            
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!formData.name.trim()">
              {{ tag ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagModal',
  props: {
    tag: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formData: {
        name: ''
      }
    }
  },
  mounted() {
    if (this.tag) {
      this.formData = {
        name: this.tag.name || ''
      }
    }
  },
  methods: {
    handleSubmit() {
      if (this.formData.name.trim()) {
        this.$emit('save', this.formData)
      }
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