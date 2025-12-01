<template>
  <div class="list-group-item note-list-item d-flex align-items-center" @click="$emit('edit', note)">
    <div class="flex-grow-1">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="mb-1 note-title">{{ note.title }}</h6>
        
        <div class="note-badges d-flex">
          <span v-if="note.access_type === 'shared'" class="badge bg-info me-1" title="Note partagée">
            <i class="fas fa-share-alt"></i>
          </span>
          
          <span v-if="note.project_name" class="badge bg-secondary me-1" :title="note.project_name">
            <i class="fas fa-folder"></i>
          </span>
          
          <span v-if="note.comments_count > 0" class="badge bg-warning" :title="`${note.comments_count} commentaire(s)`">
            <i class="fas fa-comments"></i> {{ note.comments_count }}
          </span>
        </div>
      </div>
      
      <p class="mb-2 text-muted note-preview" v-if="notePreview">
        {{ notePreview }}
      </p>
      
      <!-- Tags -->
      <div class="note-tags mb-2" v-if="note.tags && note.tags.length > 0">
        <span 
          v-for="tag in note.tags.slice(0, 5)" 
          :key="tag.id"
          class="badge me-1"
          :style="{ backgroundColor: tag.color, fontSize: '0.7rem' }"
        >
          {{ tag.name }}
        </span>
        <span v-if="note.tags.length > 5" class="text-muted small">
          +{{ note.tags.length - 5 }}
        </span>
      </div>
      
      <div class="note-meta d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <i class="fas fa-calendar me-1"></i>
          {{ formatDate(note.updated_date || note.creation_date) }}
          
          <span v-if="note.project_name" class="ms-3">
            <i class="fas fa-folder me-1"></i>
            {{ note.project_name }}
          </span>
        </small>
        
        <div class="note-actions" @click.stop>
          <div class="dropdown">
            <button 
              class="btn btn-sm btn-link text-muted dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#" @click="$emit('edit', note)">
                  <i class="fas fa-edit me-2"></i> Modifier
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="$emit('share', note)">
                  <i class="fas fa-share-alt me-2"></i> Partager
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click="$emit('delete', note.id)">
                  <i class="fas fa-trash me-2"></i> Supprimer
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoteListItem',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  computed: {
    notePreview() {
      if (!this.note.content) return ''
      
      // Supprimer les balises HTML et garder seulement le texte
      const textContent = this.note.content.replace(/<[^>]*>/g, '')
      
      // Limiter à 200 caractères pour la vue liste
      return textContent.length > 200 
        ? textContent.substring(0, 200) + '...'
        : textContent
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        return 'Aujourd\'hui'
      } else if (diffInDays === 1) {
        return 'Hier'
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`
      } else {
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }
    }
  }
}
</script>

<style scoped>
.note-list-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  padding: 1rem;
}

.note-list-item:hover {
  background-color: #f8f9fa;
  border-left-color: #007bff;
  transform: translateX(5px);
}

.note-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.note-preview {
  font-size: 0.875rem;
  line-height: 1.4;
  color: #6c757d;
  margin-bottom: 0.75rem;
}

.note-badges .badge {
  font-size: 0.7rem;
}

.note-tags .badge {
  font-size: 0.7rem;
  color: white;
  border: none;
}

.note-meta {
  font-size: 0.8rem;
  color: #6c757d;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.note-actions .dropdown-toggle {
  border: none;
  padding: 0.25rem;
}

.note-actions .dropdown-toggle::after {
  display: none;
}

.note-actions:hover .dropdown-toggle {
  color: #007bff !important;
}

@media (max-width: 768px) {
  .note-list-item {
    padding: 0.75rem;
  }
  
  .note-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .note-actions {
    margin-top: 0.5rem;
    align-self: flex-end;
  }
}
</style>