<script>
    import {Account} from './utils.js';
    export default {
        props: ["topic"],
        data(){
            return {
                content: ""
            }
        },
        methods: {
            submit(){
                let bytesContent = new TextEncoder().encode(this.content).length;

                let bytesUsed = this.$wallet.accountId.length + bytesContent + 100;

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

                        for(let i = 0;i<20;i++){
                            
                            

                            ready = ready.then(()=>{

                                console.log(i);

                                return ac.callMethod({
                                    contractId: this.$wallet.CONTRACT_ADDRESS,
                                    method: 'addPost',
                                    args:{
                                        topicidx: this.topic.topicidx,
                                        content: this.content
                                    },
                                    deposit: yocto
                                })
                                
                            })

                        }

                    });

                    return;
                    */

                    this.$wallet.callMethod({
                        contractId: this.$wallet.CONTRACT_ADDRESS,
                        method: 'addPost',
                        args:{
                            topicidx: this.topic.topicidx,
                            content: this.content
                        },
                        deposit: yocto
                    })

                })

            }
        }
    }

</script>

<template>

    <div class="maincat">Reply</div>

    <div class="panel">
        
        Post:
        <div>
            <textarea type="textarea" rows="15" cols="30" v-model="content"></textarea>
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