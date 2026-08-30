import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from "react-redux"
import store from './redux/store.js'
import axios from 'axios'
import { getToken } from './auth.js'

axios.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
 <Provider store={store}>
    <App />
 </Provider>
  </BrowserRouter>
)
