<template>
  <div class="form-width">
    <div class="field">
      <input 
        class="input" 
        v-model="email" 
        type="email" 
        placeholder="Email">
    </div>

    <div class="field">
      <input 
        class="input is-half" 
        v-model="password" 
        type="password" 
        placeholder="Password"
     
        >
    </div>

    <div class="has-text-right mb-4">
      <a href="#">Forgot Password?</a>
    </div>

    <div class="has-text-centered">
      <button class="button is-danger is-medium custom-button">Log In</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: ''
    }
  }
}
</script>

<style scoped>
.form-width {
  width: 50%;
}

.custom-button {
  width: 80%;
}
</style>