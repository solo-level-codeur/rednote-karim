<template>
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-body p-3">
      <div class="row g-3">
        <div class="col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-muted">
              <i class="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control border-start-0 ps-0" 
              placeholder="Search by keyword, project, or contributor"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
            >
          </div>
        </div>
        
        <div class="col-md-7">
          <div class="d-flex gap-2">
            <div class="dropdown">
              <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Tags
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">All Tags</a></li>
              </ul>
            </div>
            
            <div class="dropdown">
              <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Languages
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">All Languages</a></li>
              </ul>
            </div>
            
            <div class="dropdown">
              <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Note Type
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">All Types</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchFilterBar',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue']
}
</script>
