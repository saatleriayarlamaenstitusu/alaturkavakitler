import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { clickOutside } from './directives/clickOutside'
import './assets/css/base.css'
import './assets/css/typography.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('click-outside', clickOutside)
app.mount('#app')
