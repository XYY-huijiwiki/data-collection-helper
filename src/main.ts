import { createApp } from 'vue'

import App from './App.vue'

// add div#data-collection to the DOM
const dataCollection = document.createElement('div')
dataCollection.id = 'data-collection-helper'
document.body.appendChild(dataCollection)

const app = createApp(App)

app.mount('#data-collection-helper')
