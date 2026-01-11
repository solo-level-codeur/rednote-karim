<template>
  <div 
    v-if="show"
    class="modal fade show d-block" 
    tabindex="-1" 
    style="background-color: rgba(0,0,0,0.5);"
    @click.self="$emit('close')"
  >
    <div 
      class="modal-dialog"
      :class="modalSizeClass"
    >
      <div class="modal-content">
        <div class="modal-header" v-if="title || $slots.header">
          <slot name="header">
            <h5 class="modal-title">
              <i v-if="icon" :class="icon" class="me-2"></i>
              {{ title }}
            </h5>
          </slot>
          <button 
            type="button" 
            class="btn-close" 
            @click="$emit('close')"
          ></button>
        </div>
        
        <div class="modal-body">
          <slot></slot>
        </div>
        
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="$emit('close')"
            >
              Fermer
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    }
  },
  computed: {
    modalSizeClass() {
      const sizes = {
        sm: 'modal-sm',
        md: '',
        lg: 'modal-lg', 
        xl: 'modal-xl'
      }
      return sizes[this.size]
    }
  },
  emits: ['close']
}
</script>