// Simple toast notification system
class Toast {
  constructor() {
    this.container = null
    this.init()
  }

  init() {
    // Créer le conteneur de toasts s'il n'existe pas
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.className = 'toast-container position-fixed top-0 end-0 p-3'
      this.container.style.zIndex = '9999'
      document.body.appendChild(this.container)
    }
  }

  show(message, type = 'info', duration = 4000) {
    const toast = this.createToast(message, type)
    this.container.appendChild(toast)

    // Animation d'entrée
    setTimeout(() => {
      toast.classList.add('show')
    }, 100)

    // Auto-suppression
    setTimeout(() => {
      this.remove(toast)
    }, duration)

    return toast
  }

  createToast(message, type) {
    const toast = document.createElement('div')
    toast.className = `toast align-items-center text-white bg-${this.getBootstrapClass(type)} border-0`
    toast.role = 'alert'
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="fas ${this.getIcon(type)} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
      </div>
    `
    return toast
  }

  getBootstrapClass(type) {
    const classes = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'primary'
    }
    return classes[type] || 'primary'
  }

  getIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-triangle',
      warning: 'fa-exclamation-circle',
      info: 'fa-info-circle'
    }
    return icons[type] || 'fa-info-circle'
  }

  remove(toast) {
    toast.classList.remove('show')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }

  success(message, duration) {
    return this.show(message, 'success', duration)
  }

  error(message, duration) {
    return this.show(message, 'error', duration)
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration)
  }

  info(message, duration) {
    return this.show(message, 'info', duration)
  }
}

// Instance globale
const toast = new Toast()

// Plugin Vue
export default {
  install(app) {
    app.config.globalProperties.$toast = toast
    app.provide('toast', toast)
  }
}

export { toast }