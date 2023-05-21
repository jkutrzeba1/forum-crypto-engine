import {connect, keyStores, providers, KeyPair, utils} from 'near-api-js';

function uint8arr_to_hexstr(arr){

    let hexOut = "";

    for(let i = 0; i<arr.byteLength; i++){

        let c = arr[i].toString(16);

        if(c.length==1) hexOut += '0';
        hexOut += c;

    }

    return hexOut;
}

const THIRTY_TGAS = '300000000000000';
const NO_DEPOSIT = '0';

function Account(accId, createAccessKeyFor){

    this.accountId = accId;
    this.createAccessKeyFor = createAccessKeyFor;

}

function createAccount(){

    let kp = KeyPair.fromRandom("ED25519");
    let accId = uint8arr_to_hexstr(kp.publicKey.data);

    console.log(accId);

    const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();

    return myKeyStore.setKey("testnet", accId, kp)
    .then(()=>{

        return new Account(accId);
    })    

}

Account.prototype.viewMethod = function({contractId, method, args}){

    console.log(this.acc);

    return this.acc.viewFunction(contractId,method, args)
    .then((result)=>{

        return result;
    })
}

Account.prototype.callMethod = function({method, args = {}, contractId, deposit = NO_DEPOSIT, gas = THIRTY_TGAS}){

    return this.acc.functionCall({
        contractId: contractId,
        methodName: method,
        args,
        gas,
        attachedDeposit: deposit,
        jsContract: true
    })
    .then((transaction)=>{

        let f = providers.getTransactionLastResult(transaction);

        return transaction;
    })

}

Account.prototype.startUp = function(){

    const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
    const connectionConfig = {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store 
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    };

    this.provider = new providers.JsonRpcProvider({ url: connectionConfig.nodeUrl });

    return connect(connectionConfig)
    .then((near)=>{

        console.log(near);

        return near.account(this.accountId)
        .then((acc)=>{

            console.log(acc);

            this.acc = acc;

            return true;
        })

    });

}

Account.prototype.createAccount = function(acc_name, nearAmount){

    let kp = KeyPair.fromRandom("ED25519");
    const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();

    myKeyStore.setKey("testnet", acc_name, kp);

    return this.acc.functionCall({
        contractId: "testnet",
        methodName: "create_account",
        args: {
            new_account_id: acc_name,
            new_public_key:  kp.publicKey.toString()
        },
        gas: "300000000000000",
        attachedDeposit: utils.format.parseNearAmount(nearAmount)
    })


}

function parseAmountDecimals(str, decimals){

    let fraction;
    let integer;

    if(str.length<=decimals){
        integer = "0";
        fraction = "0".repeat(decimals-str.length) + str;
    }
    else{
        integer = str.substring(0, str.length-decimals);
        fraction = str.substring( str.length-decimals ,str.length)
    }

    let zeroescnt = 0;

    for(let i = fraction.length-1; i>=2; i--){

        if(fraction[i] == '0'){
            zeroescnt++;
        }
        else{
            break;
        }

    }

    fraction = fraction.substring(0, fraction.length-zeroescnt);

    return integer + "." + fraction;

}

export {uint8arr_to_hexstr, createAccount, Account, parseAmountDecimals};