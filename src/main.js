//import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'


fetch('/calc.json?t='+Date.now()).then(res => res.json()).then(res=>{
    createApp(App, {
        data: res,
    }).mount('#calc')

});