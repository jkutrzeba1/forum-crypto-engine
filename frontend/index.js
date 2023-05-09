import 'regenerator-runtime/runtime';
import { createApp } from 'vue'
import App from './App.vue'
import { Wallet } from './near-wallet';

const CONTRACT_ADDRESS = process.env.CONTRACT_NAME;

let wallet = new Wallet({network: 'mainnet'});
wallet.CONTRACT_ADDRESS = "forum-crypto.near";

const app = createApp(App);

app.config.globalProperties.$wallet = wallet;
app.config.globalProperties.$admin = {
    idx: -1
}

app.mount('#app')

