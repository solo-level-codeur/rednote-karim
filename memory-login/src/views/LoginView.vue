<template>
  <div class="container">
    <div class="center-wrapper">
      <div class="text-center my-5">
        <h1 class="display-4 fw-bold text-primary">Welcome Back</h1>
      </div>
      <LoginForm />
    </div>
  </div>
</template>

<script>
import LoginForm from '../components/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    LoginForm
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