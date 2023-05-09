
<script>
import { h } from 'vue';

    import CatSettingsEdit from './CatSettingsEdit.vue';

    export default {
        props: ["cattree"],
        data(){
            return {
                activeView: '',
                activeCat: null
            }
        },
        mounted(){

        },
        methods: {
            renderChilds(childs,lvl){

                console.log(childs);

                return childs.map((cat)=>{

                    let addBtn = h('img', { onClick: ()=>{ this.newNode(cat); }, class: 'btn-set', src: 'data:image/svg+xml;utf-8,%3Csvg%20width%3D%22800px%22%20height%3D%22800px%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%0A%3Ctitle%2F%3E%0A%0A%3Cg%20id%3D%22Complete%22%3E%0A%0A%3Cg%20data-name%3D%22add%22%20id%3D%22add-2%22%3E%0A%0A%3Cg%3E%0A%0A%3Cline%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20x1%3D%2212%22%20x2%3D%2212%22%20y1%3D%2219%22%20y2%3D%225%22%2F%3E%0A%0A%3Cline%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20x1%3D%225%22%20x2%3D%2219%22%20y1%3D%2212%22%20y2%3D%2212%22%2F%3E%0A%0A%3C%2Fg%3E%0A%0A%3C%2Fg%3E%0A%0A%3C%2Fg%3E%0A%0A%3C%2Fsvg%3E'});
                    let editBtn = h('img', { onClick: ()=>{ this.editNode(cat) }, class: 'btn-set', src: 'data:image/svg+xml;utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20%20%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20class%3D%22feather%20feather-edit%22%3E%3Cpath%20d%3D%22M20%2014.66V20a2%202%200%200%201-2%202H4a2%202%200%200%201-2-2V6a2%202%200%200%201%202-2h5.34%22%3E%3C%2Fpath%3E%3Cpolygon%20points%3D%2218%202%2022%206%2012%2016%208%2016%208%2012%2018%202%22%3E%3C%2Fpolygon%3E%3C%2Fsvg%3E'});

                    return h('div', { style: { marginLeft: lvl*5 + 'px' } }, [addBtn, editBtn, cat.title].concat(this.renderChilds(cat.childs, lvl+1)));
                });

            },
            newNode(cat){

                this.activeView = 'newnode';
                this.activeCat = cat;

            },
            editNode(cat){

                this.activeView = 'editnode';
                this.activeCat = cat;

            }
        },
        render(){

            let catsettingsview = h(CatSettingsEdit, {activeView: this.activeView, activeCat: this.activeCat, cattree: this.cattree});
            let addBtn = h('img', { onClick: ()=>{ this.newNode(this.cattree); }, class: 'btn-set', src: 'data:image/svg+xml;utf-8,%3Csvg%20width%3D%22800px%22%20height%3D%22800px%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%0A%3Ctitle%2F%3E%0A%0A%3Cg%20id%3D%22Complete%22%3E%0A%0A%3Cg%20data-name%3D%22add%22%20id%3D%22add-2%22%3E%0A%0A%3Cg%3E%0A%0A%3Cline%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20x1%3D%2212%22%20x2%3D%2212%22%20y1%3D%2219%22%20y2%3D%225%22%2F%3E%0A%0A%3Cline%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20x1%3D%225%22%20x2%3D%2219%22%20y1%3D%2212%22%20y2%3D%2212%22%2F%3E%0A%0A%3C%2Fg%3E%0A%0A%3C%2Fg%3E%0A%0A%3C%2Fg%3E%0A%0A%3C%2Fsvg%3E'});

            return h('div', [addBtn, "Root"].concat(this.renderChilds(this.cattree.childs, 1)).concat([catsettingsview]));
        }
    }
</script>

<style>
    .btn-set{
        position: relative;
        top: 4px;
        width: 20px;
        height: 20px;
    }
</style>