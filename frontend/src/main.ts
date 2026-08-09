import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Antd from 'ant-design-vue';
import Vant from 'vant';
import 'ant-design-vue/dist/reset.css';
import 'vant/lib/index.css';
import router from './router';
import App from './App.vue';
import './style.css';
import './styles/variables.css';
import './styles/responsive.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);
app.use(Vant);

app.mount('#app');
