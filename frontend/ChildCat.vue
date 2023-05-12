<script>

    import TopicNew from './TopicNew.vue';
    

    export default {
        components:{
            TopicNew
        },
        props: ["topics", "cat"],
        data(){
            return {
                curView: 'topiclist',
                curPage: 1,
                totalPages: 1,
                topicsArr: this.topics,
                activeCat: this.cat
            }
        },
        computed: {
            hasChildBoards(){
                if(this.activeCat.childs.length>0) return true;
                return false;
            },
            hasNextPage(){
                if(this.curPage<this.totalPages) return true;

                return false;
            }
        },
        methods: {
            newTopic(){
                this.curView = 'newtopic';
            },
            nextPage(){

                if(this.hasNextPage == false) return;

                this.$wallet.viewMethod({
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    method: 'getTopics',
                    args:{
                        prevtopicidx: this.topicsArr[this.topicsArr.length-1].topicidx
                    }
                })
                .then((topics)=>{
                    this.topicsArr = topics;
                    this.curPage++;
                })

            },
            goToChildCat(cat){

                this.activeCat = cat;

                this.$wallet.viewMethod({
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    method: 'catMeta',
                    args:{
                        catidx: cat.id
                    }
                })
                .then((response)=>{

                    this.totalPages = parseInt(response.totalPages / 20) + (response.totalPages % 20 != 0 ? 1:0);

                })
                .then(()=>{

                    this.$wallet.viewMethod({
                        method: "getTopics",
                        args: {
                            catidx: cat.id
                        },
                        contractId: this.$wallet.CONTRACT_ADDRESS
                    })
                    .then((topics)=>{

                        this.topicsArr = topics;

                    })

                });

            }
        },
        mounted(){

            this.$wallet.viewMethod({
                contractId: this.$wallet.CONTRACT_ADDRESS,
                method: 'catMeta',
                args:{
                    catidx: this.cat.id
                }
            })
            .then((response)=>{

                this.totalPages = parseInt(response.totalPages / 20) + (response.totalPages % 20 != 0 ? 1:0);

            })

        }
    }
</script>

<template>
    <div>
        <TopicNew v-if="curView=='newtopic'" :cat="activeCat"/>
        <template v-else-if="curView=='topiclist'">
            <div v-if="hasChildBoards">
                <div class="maincat">Child boards</div>

                <div class="childcat" v-for="catItem in activeCat.childs">
                    <img src="./assets/childcat.svg"/>
                    <div class="row">
                        <a class="link" @click="()=>{goToChildCat(catItem)}">{{ catItem.title }}</a> <br/>
                        <span class="desc">{{ catItem.desc }}</span>
                    </div>
                </div>

            </div>
            <div class="topics-panel">
                <button @click="newTopic" class="btn btn-main" :style="{fontSize: '9px'}">NEW TOPIC</button>
                <div class="pagination">Page {{ curPage }} from {{ totalPages }}</div>
                <a :class="{nextpage: hasNextPage, nextpagedisabled: !hasNextPage}" @click="nextPage">Next page >></a>
            </div>
            <div>
                <div class="topic-box" v-for="topic in topicsArr">
                    <img class="subject-img" src="./assets/subject.svg" />
                    <div class="subject">
                        <span class="title"><a @click="()=>{this.$emit('topic', topic)}">{{topic.title}}</a></span> <br/>
                        <span class="title-foot">Started by {{ topic.author }}</span>
                    </div>
                </div>
            </div>
        </template>



    </div>
</template>

<style>
    .topics-panel{
        margin-top: 20px;
    }
    .topic-box{
        margin-top: 10px;
        margin-left: 20px;
    }
    .subject-img{
        width: 45px;
        height: 45px;
        display: inline-block;
        margin-right: 13px;
    }
    .subject{
        width: 30%;
        display: inline-block;
        position: relative;
        top: -6px;
    }
    .title{
        color: #2a75b7;
    }
    .title:hover{
        cursor: pointer;
    }
    .title-foot{
        font-size: 11px;
    }
    .pagination{
        display: inline-block;
        font-size: 10px;
        margin: 0 12px;
    }
    .nextpage{
        color: rgb(255, 123, 0);
        font-size: 13px;
    }
    .nextpagedisabled{
        color: rgb(114, 114, 114);
        font-size: 13px;
    }
    .nextpage:hover, .nextpagedisabled:hover{
        cursor: pointer;
    }
</style>