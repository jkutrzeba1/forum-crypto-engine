<script>
    export default {
        data(){

            let menu = [{label: "FORUM", ev: "maincat"}, {label: "FORC WALLET", ev: "wallet"}]
            .map((item)=>{

                return {
                    ...item,
                    active: false
                }

            })

            menu[0].active = true;

            return {
                activeMenu: menu[0],
                menu: menu
            }
        },
        methods:{
            goToMenu(menuItem){
                this.activeMenu.active = false;
                menuItem.active = true;
                this.activeMenu = menuItem;

                this.$emit("goToView", menuItem.ev);

            }
        }
    }
</script>

<template>
    <div class="forum">

        <span v-for="menuItem in menu">
            <a :class="{active: menuItem.active}" @click="()=>{this.goToMenu(menuItem)}">{{menuItem.label}}</a>
        </span>

    </div>
</template>

<style>
    .forum {
        display: inline-block;
        margin: 15px;
    }
    .forum > span{
        border-right: 1px solid black;
        padding: 7px;
        font-size: 12px;
    }
    .forum a:hover{
        border-bottom: 1px solid black;
        cursor: pointer;
    }
    .forum > span:last-child{
        border-right: 0px solid black;
    }
    .active{
        border-bottom: 1px solid black;
    }
</style>