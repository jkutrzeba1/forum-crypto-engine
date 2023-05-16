<script>

    import NewPost from './NewPost.vue';

    export default{
        components:{
            NewPost
        },
        props: ["posts", "topic"],
        data(){
            return {
                curPage: 1,
                totalPages: 1,
                activeView: "posts",
                postsArr: [],
                firstPostIdx: -1,
                postEdited: null
            }
        },
        computed:{
            hasNextPage(){
                if(this.curPage<this.totalPages) return true;
                return false;
            }
        },
        methods:{
            reply(){
                this.activeView = "reply";
            },
            editPost(post, index){

                this.activeView = "reply";
                post.postShift = index+1;
                post.isTopicIdx = this.firstPostIdx != -1 ? false : true;
                post.idx = this.firstPostIdx != -1 ? this.firstPostIdx : this.topic.topicidx;

                this.postEdited = post;

            },
            nextPage(){

                if(!this.hasNextPage) return;

                this.$wallet.viewMethod({
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    method: "getPosts",
                    args:{
                        nextpostidx: this.postsArr[this.postsArr.length-1].next
                    }
                })
                .then((posts)=>{

                    this.curPage++;
                    this.firstPostIdx = this.postsArr[this.postsArr.length-1].next;
                    
                    this.postsArr = posts.map((post)=>{

                        post.content = post.content.replace(/\n/g, "<br/>")

                        return post;
                    });

                })

            },
            deletePost(post, index){

                let isTopicIdx, idx, postShift;

                postShift = index+1;

                if(this.firstPostIdx != -1){
                    isTopicIdx = false;
                    idx = this.firstPostIdx;
                }
                else{
                    isTopicIdx = true;
                    idx = this.topic.topicidx
                }

                this.$wallet.callMethod({
                    contractId: this.$wallet.CONTRACT_ADDRESS,
                    method: "deletePost",
                    args:{
                        isTopicIdx, idx, postShift
                    }
                })

            }

        },
        mounted(){

            this.postsArr = this.posts.map((post)=>{

                post.content = post.content.replace(/\n/g, "<br/>")

                return post;
            })

            this.$wallet.viewMethod({
                contractId: this.$wallet.CONTRACT_ADDRESS,
                method: 'topicMeta',
                args:{
                    topicidx: this.topic.topicidx
                }
            })
            .then((res)=>{

                this.totalPages = parseInt(res.postsTotal / 20) + (res.postsTotal % 20 != 0 ? 1:0);

            })

        }
    }
</script>

<template>
    <div>
        <div class="maincat">{{ topic.title }}</div>

        <NewPost v-if="activeView=='reply'" :topic="topic" :post="postEdited" />
        <template v-if="activeView=='posts'">

            <button @click="reply" class="btn btn-main" :style="{fontSize: '9px', margin: '8px 3px'}">REPLY</button>
            <div class="pagination">
                Page {{ curPage }} from {{ totalPages }} 
            </div>
            <a :class="{nextpage: hasNextPage, nextpagedisabled: !hasNextPage}" @click="nextPage">Next page >></a>
            <div class="post" v-for="(post,index) in postsArr">
                <div class="author">
                    <img src="./assets/user.svg"/>
                    <span class="label">{{ post.author }}</span>
                </div>
                <div class="content">
                    <div v-html="post.content">

                    </div>
                    <div v-if="$admin.idx!=-1 && !(firstPostIdx==-1 && index==0)" class="post-buttons">
                        <img @click="()=>{deletePost(post, index)}" src="./assets/trash.svg"/>
                        <img @click="()=>{editPost(post, index)}" src="./assets/edit.svg"/>
                    </div>
                </div>

            </div>
        </template>
    </div>
</template>

<style>
    .post-buttons{
        margin-top: 15px;
    }
    .post-buttons img{
        width: 18px;
        height: 18px;
    }
    .post-buttons img:hover{
        cursor: pointer;
    }
    .post{
        padding: 8px 8px 0 8px;
        min-height: 60px;
        border: 1px solid black;
        border-bottom: 0;
    }
    .post:last-child{
        border-bottom: 1px solid black;
    }
    .author{
        display: inline-block;
        width: 200px;
        vertical-align: top;
    }
    .author .label{
        display: inline-block;
        position: relative;
        top: -3px;
        margin-left: 3px;;
    }
    .author > img {
        width: 20px;
        height: 20px;
    }
    .content {
        display: inline-block;
        width: 60%;
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