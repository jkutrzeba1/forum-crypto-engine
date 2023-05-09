<script>

    import {utils} from 'near-api-js';

    export default {
        props: ["activeView", "activeCat", "cattree"],
        data(){
            return {
                originalCatTree: "",
                originalCatsCnt: null,
                title: '',
                desc: ''
            }
        },

        mounted(){

            this.originalCatsCnt = this.cattree.idcnt;
            this.originalCatTree = JSON.stringify(this.cattree);

        },

        computed:{

        },

        watch: {
            activeCat(newv, oldv){
                if(newv!=oldv && this.activeView == 'newnode'){
                    this.title = "";
                    this.desc = "";
                }
                if(newv!=oldv && this.activeView == 'editnode'){
                    this.title = newv.title;
                    this.desc = newv.desc;
                }
            },
            activeView(newv, oldv){
                if(newv=='newnode'){
                    this.title = "";
                    this.desc = "";
                }

                if(newv=='editnode'){
                    this.title = this.activeCat.title;
                    this.desc = this.activeCat.desc;
                }
            }
        },

        methods: {
            preview(){
                if(this.activeView=='newnode'){

                    this.activeCat.childs.push({
                        title: this.title,
                        desc: this.desc,
                        childs: [],
                        id: ++this.cattree.idcnt
                    })

                }
                if(this.activeView=='editnode'){

                    this.activeCat.title = this.title;
                    this.activeCat.desc = this.desc;

                }
            },
            confirm(){

                let bytesUsed = JSON.stringify(this.cattree).length - this.originalCatTree.length;
                if(bytesUsed<0) bytesUsed = 0;

                let cntNewCats = this.cattree.idcnt - this.originalCatsCnt;
                if(cntNewCats<0) cntNewCats = 0;

                bytesUsed += cntNewCats * 20;

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
                        method: 'addCategory',
                        args: {
                            treesnap: this.cattree,
                            adminidx: this.$admin.idx,
                            newCatsCnt: cntNewCats
                        },
                        deposit: yocto
                    });

                })

            }
        }
    }
</script>

<template>
    <div>
        <div class="head">
            <div v-if="activeView=='editnode'">
                Edit category
            </div>
            <div v-if="activeView=='newnode'">
                New category
            </div>
        </div>
        <div v-if="activeView!=''">

            Title: <input type="text" v-model="title"/> <br/>
            Description: <input type="text" v-model="desc"/>

            <div>
                <button @click="preview" class="btn btn-main">PREVIEW</button>
                <button @click="confirm" class="btn btn-main">CONFIRM</button>
            </div>

        </div>

    </div>
</template>

<style>
    .head{
        font-size: 22px;
    }
</style>