<template>
  <div class="container">
    

    
    <AppHeader />
    
    <div class="center-wrapper">
      <div class="has-text-centered mt-6 mb-6">
        <h1 class="title is-2">Welcome Back</h1>
      </div>
      <LoginForm />
    </div>
  </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue'
import LoginTitle from '../components/LoginTitle.vue'
import LoginForm from '../components/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    AppHeader,
    LoginTitle,
    LoginForm,
    
  }
}
</script>

<style scoped>
.center-wrapper {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>