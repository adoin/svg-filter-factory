import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
