<script>
    export default{
        props: ["cattree"],
        data(){
            return {

            }
        }

    }
</script>

<template>
    <div>

        <div v-for="maincat in cattree.childs">
            <div class="maincat">
                {{maincat.title}}
            </div>
            <div class="childcat" v-for="cat in maincat.childs">
                <img src="./assets/childcat.svg"/>
                <div class="row">
                    <a class="link" @click="()=>{ this.$emit('childcat', cat) }">{{ cat.title }}</a> <br/>
                    <span class="desc">{{ cat.desc }}</span>
                </div>
            </div>

        </div>

    </div>
</template>

<style>

</style>