import 'regenerator-runtime/runtime';
import { createApp } from 'vue'
import App from './App.vue'
import { Wallet } from './near-wallet';

if (process.env.NODE_ENV === "development") {
    globalThis.__VUE_OPTIONS_API__ = true
    globalThis.__VUE_PROD_DEVTOOLS__ = true;
 } else {
    // different values for production.
    globalThis.__VUE_OPTIONS_API__ = false;
    globalThis.__VUE_PROD_DEVTOOLS__ = false;
 }

const CONTRACT_ADDRESS = process.env.CONTRACT_NAME;

let wallet = new Wallet({network: 'mainnet'});
wallet.CONTRACT_ADDRESS = "forum-crypto.near";

const app = createApp(App);

app.config.globalProperties.$wallet = wallet;
app.config.globalProperties.$admin = {
    idx: -1
}

app.mount('#app')

