<script>

    import {Account} from './utils.js';

    export default {
        props: ["cat"],
        data(){
            return{
                subject: "",
                text: ""
            }
        },
        methods: {
            submit(){

                let subjectBytes = new TextEncoder().encode(this.subject).length;
                let textBytes = new TextEncoder().encode(this.text).length;

                let bytesUsed = this.$wallet.accountId.length*2 + subjectBytes + textBytes + 220;

                console.log(bytesUsed);

                this.$wallet.viewMethod({
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    method: 'getCost',
                    args:{
                        bytes: bytesUsed
                    }
                })
                .then((yocto)=>{

                    /*
                    
                    let ac = new Account("okot.testnet");

                    ac.startUp()
                    .then(()=>{

                        
                        let ready = Promise.resolve();

                        for(let i = 0; i<5; i++){

                            ready = ready.then(()=>{

                                console.log(i);

                                return ac.callMethod({
                                    contractId: this.$wallet.CONTRACT_ADDRESS,
                                    method: 'addTopic',
                                    args: {
                                        catidx: this.cat.id,
                                        title: this.subject,
                                        content: this.text
                                    },
                                    deposit: yocto
                                })
                            });

                        }

                    })

                    return;

                    */

                    this.$wallet.callMethod({
                        contractId: this.$wallet.CONTRACT_ADDRESS,
                        method: 'addTopic',
                        args:{
                            catidx: this.cat.id,
                            title: this.subject,
                            content: this.text
                        },
                        deposit: yocto
                    })
                })



            }
        }
    }
</script>

<template>

    <div class="maincat">Start new topic</div>

    <div class="panel">
        
        <div>
            <div :style="{display: 'inline-block', width: '10%'}"> Subject:</div> 
            <input type="text" v-model="subject" :style="{display: 'inline-block', width: '60%'}"> 
        </div>

        <div>
            <textarea type="textarea" rows="15" cols="30" v-model="text"></textarea>
        </div>

        <div>
            <button @click="submit" class="btn btn-main">SUBMIT</button>
        </div>


    </div>

</template>

<style>
    .panel{
        margin: 50px;
    }
    .panel > div{
        margin-top: 12px;
    }
    .panel textarea{
        width: 70%;
    }
</style>