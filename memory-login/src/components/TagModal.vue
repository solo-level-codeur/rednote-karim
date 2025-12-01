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
            
            <div class="mb-3">
              <label for="tagColor" class="form-label">Couleur</label>
              <div class="d-flex align-items-center">
                <input 
                  type="color" 
                  class="form-control form-control-color me-3" 
                  id="tagColor"
                  v-model="formData.color"
                  style="width: 60px; height: 38px;"
                >
                <span class="text-muted">{{ formData.color }}</span>
              </div>
            </div>

            <!-- Couleurs prédéfinies -->
            <div class="mb-3">
              <label class="form-label">Couleurs rapides</label>
              <div class="quick-colors">
                <button
                  type="button"
                  v-for="color in predefinedColors"
                  :key="color"
                  class="color-btn"
                  :style="{ backgroundColor: color }"
                  :class="{ active: formData.color === color }"
                  @click="formData.color = color"
                ></button>
              </div>
            </div>

            <!-- Prévisualisation -->
            <div class="mb-3">
              <label class="form-label">Aperçu</label>
              <div class="tag-preview">
                <span 
                  class="badge"
                  :style="{ backgroundColor: formData.color, color: getTextColor(formData.color) }"
                >
                  {{ formData.name || 'Nom du tag' }}
                </span>
              </div>
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
        name: '',
        color: '#808080'
      },
      predefinedColors: [
        '#dc3545', '#fd7e14', '#ffc107', '#198754', 
        '#20c997', '#0dcaf0', '#0d6efd', '#6f42c1', 
        '#d63384', '#6c757d'
      ]
    }
  },
  mounted() {
    if (this.tag) {
      this.formData = {
        name: this.tag.name || '',
        color: this.tag.color || '#808080'
      }
    }
  },
  methods: {
    handleSubmit() {
      if (this.formData.name.trim()) {
        this.$emit('save', this.formData)
      }
    },

    getTextColor(backgroundColor) {
      // Convertir hex en RGB
      const hex = backgroundColor.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      
      // Calculer la luminosité
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      
      // Retourner blanc ou noir selon la luminosité
      return luminance > 0.5 ? '#000000' : '#ffffff'
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

.quick-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-btn {
  width: 30px;
  height: 30px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
  border-color: #007bff;
}

.color-btn.active {
  border-color: #007bff;
  border-width: 3px;
  transform: scale(1.1);
}

.tag-preview {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px dashed #dee2e6;
}

.form-control-color {
  border: 1px solid #ced4da;
}
</style>