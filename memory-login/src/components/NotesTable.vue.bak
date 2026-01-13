<template>
  <div class="card border-0 shadow-sm">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light">
          <tr>
            <th scope="col" class="text-secondary ps-4 py-3 border-bottom-0" style="width: 40%;">TITLE</th>
            <th scope="col" class="text-secondary py-3 border-bottom-0">AUTHOR</th>
            <th scope="col" class="text-secondary py-3 border-bottom-0">CREATED</th>
            <th scope="col" class="text-secondary text-end pe-4 py-3 border-bottom-0">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="notes.length === 0">
            <td colspan="4" class="text-center py-5 text-muted">
              No notes found.
            </td>
          </tr>
          <tr 
            v-for="note in notes" 
            :key="note.uniqueId" 
            style="cursor: pointer;"
            @click="$emit('open-note', note)"
          >
            <td class="ps-4 py-3 border-bottom-0">
              <div class="fw-bold text-dark">{{ note.title || 'Untitled Note' }}</div>
            </td>
            <td class="py-3 border-bottom-0">
              <div class="d-flex align-items-center">
                <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-2 text-primary fw-bold" style="width: 32px; height: 32px; font-size: 0.8rem;">
                  {{ getInitials(note.authorName) }}
                </div>
                <span class="text-dark">{{ note.authorName }}</span>
              </div>
            </td>
            <td class="text-muted py-3 border-bottom-0">
              {{ formatDate(note.created_at || note.shared_at) }}
            </td>
            <td class="text-end pe-4 py-3 border-bottom-0">
              <button class="btn btn-link text-secondary p-0 text-decoration-none" @click.stop>
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotesTable',
  props: {
    notes: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['open-note'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    getInitials(name) {
      if (!name) return '?'
      if (name === 'Me') return 'ME'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }
  }
}
</script>
