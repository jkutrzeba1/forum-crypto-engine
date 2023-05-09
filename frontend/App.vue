<script>

    import Cat from './Cat.vue';
    import ChildCat from './ChildCat.vue';
    import Topic from './Topic.vue';
    import CatSettings from './CatSettings.vue';

    import {createAccount, Account } from './utils.js';


    export default{
        components:{
            ChildCat, Cat, Topic, CatSettings
        },
        data(){
            return {
                isSignedIn: false,
                cattree: {},
                walletReady: false,
                activeView: "maincat",
                topics: [],
                curCat: null,
                posts: [],
                curTopic: null
            }
        },
        computed: {
            isAdmin(){
                if(this.$admin.idx!=-1) return true;
                return false;
            }
        },
        mounted(){

            this.$wallet.startUp()
            .then((isSignedIn)=>{

                this.isSignedIn = isSignedIn;


            })
            .then(()=>{

                this.$wallet.viewMethod({
                    method: "getMeta",
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    args: {
                        adminId: this.$wallet.accountId
                    }
                })
                .then((result)=>{

                    let {cattree, idx} = result;
                    console.log(idx);
                    this.cattree = cattree;
                    this.$admin.idx = idx;
                    this.walletReady = true;
                })

            })

        },
        methods:{
            goToChildCatView(cat){

                console.log(cat.id);

                this.$wallet.viewMethod({
                    method: "getTopics",
                    args: {
                        catidx: cat.id
                    },
                    contractId: this.$wallet.CONTRACT_ADDRESS
                })
                .then((topics)=>{

                    this.topics = topics;
                    this.curCat = cat;
                    this.activeView = "childcat";

                })
            },
            goToTopicView(topic){

                this.$wallet.viewMethod({
                    method: 'getPosts',
                    args: {
                        topicidx: topic.topicidx
                    },
                    contractId: this.$wallet.CONTRACT_ADDRESS
                })
                .then((posts)=>{

                    this.posts = posts;
                    this.curTopic = topic;
                    this.activeView = 'topic';

                })


            },
            goToCatSettings(){

                this.activeView = 'catsettings';

            },
            login(){

                this.$wallet.signIn();

            },
            logout(){

                this.$wallet.signOut();

            }

        }
    }

</script>

<template>
    <div v-if="walletReady">

        <button v-if="!isSignedIn" class="btn btn-main" @click="login">LOGIN</button>
        <button v-if="isSignedIn" class="btn btn-main" @click="logout">LOGOUT</button>

        <a v-if="isAdmin" @click="goToCatSettings"><img class="btn-big" src="./assets/settings.svg"/></a>

        <Cat v-if="activeView=='maincat'" :cattree="cattree" @childcat="(cat)=>{goToChildCatView(cat)}"/>
        <ChildCat v-if="activeView=='childcat'" :cat="curCat" :topics="topics" @childcat="(cat)=>{goToChildCatView(cat)}" @topic="(topic)=>{this.goToTopicView(topic)}"/>
        <Topic v-if="activeView=='topic'" :topic="curTopic" :posts="posts"/>
        <CatSettings v-if="activeView=='catsettings'" :cattree="cattree" />

    </div>
</template>

<style>
    .btn-big{
        margin-left: 15px;
        width: 35px;
        height: 35px;
        position: relative;
        top: 10px;
    }
    .btn-big:hover{
        cursor: pointer;    
    }
</style>