<script>
    import {Account} from './utils.js';
    export default {
        props: ["topic", "post"],
        data(){
            return {
                content: ""
            }
        },
        mounted(){

            if(this.post != null){
                this.content = this.post.content;
            }

        },
        methods: {
            submit(){

                if(this.post==null){
                    this.addPost();
                }
                else{
                    this.editPost();
                }

            },
            addPost(){

                let bytesContent = new TextEncoder().encode(this.content).length;

                let bytesUsed = this.$wallet.accountId.length + bytesContent + 150;

                console.log(bytesUsed);

                this.$wallet.viewMethod({
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    method: 'getCost',
                    args:{
                        bytes: bytesUsed
                    }
                })
                .then((yocto)=>{

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

            },
            editPost(){

                this.$wallet.callMethod({
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    method: "editPost",
                    args:{
                        isTopicIdx: this.post.isTopicIdx,
                        idx: this.post.idx,
                        postShift: this.post.postShift,
                        content: this.content
                    }
                })

            },
            submitMany_TEST(){

                let ac = new Account("okot.testnet");

                let gasDiffs = [];

                ac.startUp()
                .then(()=>{

                    let ready = Promise.resolve();

                    let mul = 100;
                    let w = 100;

                    for(let i = 1; i<=4; i++){

                        let content = "A".repeat(w);
                        w = mul;
                        mul*=10;
                        w+=mul;


                        let bytesContent = new TextEncoder().encode(content).length;
                        let bytesUsed = ac.accountId.length + bytesContent + 150;

                        console.log(bytesUsed);

                        ready = ready.then(()=>{

                            console.log(i);
                            console.log(bytesUsed);

                            return this.$wallet.viewMethod({
                                contractId: this.$wallet.CONTRACT_ADDRESS,
                                method: 'getCost',
                                args:{
                                    bytes: bytesUsed
                                }
                            })
                            .then((yocto)=>{

                                return ac.callMethod({
                                    contractId: this.$wallet.CONTRACT_ADDRESS,
                                    method: 'addPost',
                                    args:{
                                        topicidx: this.topic.topicidx,
                                        content: content
                                    },
                                    deposit: yocto
                                })
                                .then((tx)=>{

                                    console.log(tx);

                                    gasDiffs.push(tx.transaction_outcome.outcome.gas_burnt);

                                })

                            })

                        })

                    }

                    ready.then(()=>{
                        console.log(gasDiffs);
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