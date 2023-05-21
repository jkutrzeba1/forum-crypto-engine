<script>

    import {parseAmountDecimals} from './utils.js'; 

    export default{
        data(){
            return {
                tokenMeta: null,
                accMeta: null,
                isFetched: false,
                curtm: 0,
                //epoch_period: 1000*60*60*24*30
                epoch_period: 1000*60
            }
        },
        mounted(){

            this.curtm = new Date().getTime();

            this.$wallet.viewMethod({
                contractId: this.$wallet.FT_CONTRACT_ADDRESS,
                method: "ft_metadata",
            })
            .then((meta)=>{

                this.tokenMeta = meta;
            
                this.$wallet.viewMethod({
                    contractId: this.$wallet.FT_CONTRACT_ADDRESS,
                    method: "accMeta",
                    args: {
                        accountId: this.$wallet.accountId
                    }
                })
                .then((res)=>{

                    setInterval(()=>{
                        this.curtm = new Date().getTime();
                    }, 1000);

                    this.isFetched = true;
                    this.accMeta = {
                        ...res
                    }

                })

            });

        },
        methods:{

            createAccount(){

                this.$wallet.viewMethod({
                    contractId: this.$wallet.FT_CONTRACT_ADDRESS,
                    method: 'storage_balance_bounds'
                })
                .then((res)=>{

                    this.$wallet.callMethod({
                        contractId: this.$wallet.FT_CONTRACT_ADDRESS,
                        method: 'storage_deposit',
                        args: {
                            account_id: this.$wallet.accountId
                        },
                        deposit: res.min
                    });

                });

            },
            claim(){

                if(this.isLockedWithdrawAvailable==false) return;

                this.$wallet.callMethod({
                    contractId: this.$wallet.FT_CONTRACT_ADDRESS,
                    method: 'unlock'
                })

            },
            periodToNextUnlock(){

                if(this.accMeta.accLocked == null) return null;

                let tge = parseInt(this.accMeta.tge); //ms 13
                let epoch_period = this.epoch_period;
                let next_unlock = tge + epoch_period*(2+this.accMeta.accLocked.unlock_cnt + 1);
                let period = next_unlock - this.curtm;


                let elapsed = parseInt(period/1000);

                let secs = elapsed%60;
                elapsed -= secs;

                let strOut = "";
                strOut += secs + " seconds";

                if(elapsed==0){
                    return strOut;
                }

                let minutes = (elapsed/60)%60;
                elapsed -= ((elapsed/60)%60)*60;

                strOut = minutes + " minutes, " + strOut;

                if(elapsed == 0){
                    return strOut;
                }

                let hoursTotal = elapsed/60/60;
                let hours = hoursTotal%24;

                let days = parseInt(hoursTotal/24);

                if(days==0){
                    return hours + " hours, " + strOut;
                }

                return days + " days, "  + hours + " hours, " + strOut;

            }

        },
        computed:{
            TGE_NOT_LAUNCHED(){
                if(this.accMeta.tge == "0") return true;
                return false;
            },
            balance(){

                if(this.isNotRegistered == true) return "0";

                let str = this.accMeta.acc;

                return parseAmountDecimals(str, this.tokenMeta.decimals);
            },
            percentageUnlocked(){

                if(this.isLockAccount==false) return "0 %";

                let o = this.accMeta.accLocked.unlock_cnt;

                return Number(20 + o*20).toString() + " %";

            },
            amountLocked(){

                if(this.isLockAccount==false) return "0";
                if(this.accMeta.unlock_cnt == 4) return "0";

                return parseAmountDecimals(BigInt(BigInt(this.accMeta.accLocked.balance) - BigInt(this.accMeta.accLocked.balance)*BigInt(20)/BigInt(100) * BigInt(this.accMeta.accLocked.unlock_cnt + 1)).toString(), this.tokenMeta.decimals);
            },
            isNotRegistered(){

                if(this.accMeta.acc == null) return true;
                return false;

            },
            isLockAccount(){

                if(this.accMeta.accLocked != null) return true;
                return false;

            },
            isSomeBalanceNotWithrawed(){

                
                if(this.accMeta.accLocked == null) return false;
                if(this.accMeta.accLocked.unlock_cnt == 4) return false;

                return true;
            },
            isLockedWithdrawAvailable(){

                if(this.accMeta.tge == "0") return false;
                if(this.accMeta.accLocked == null) return false;

                if(this.accMeta.accLocked.unlock_cnt == 4) return false;

                let tge = parseInt(this.accMeta.tge); //ms 13

                let epoch_period = this.epoch_period;
                let next_unlock = tge + epoch_period*(2+this.accMeta.accLocked.unlock_cnt + 1);
                let period = next_unlock - this.curtm;

                if(period<=0) return true;
                return false;

            }
        }
    }
</script>

<template>
    <div v-if="isFetched" class="box">

        <div v-if="isNotRegistered" class="warn">
            Register your account first, before you can receive deposits
            <button class="btn btn-main" @click="createAccount">CREATE ACCOUNT</button>
        </div>

        <div v-else>
            Account balance: {{balance}} <br/>

            <div v-if="isLockAccount">

                Percentage unlocked: {{ percentageUnlocked }}<br/>
                Amount locked: {{ amountLocked }}<br/>

                <span v-if="isSomeBalanceNotWithrawed">

                    Period to next unlock: 
                    <span v-if="TGE_NOT_LAUNCHED" style="color:rgb(141, 41, 41)">
                        TGE is not launched *
                    </span>
                    <span v-else class="period">{{ isLockedWithdrawAvailable ? "You can claim locked balance now" : periodToNextUnlock() }}</span><br/>

                    <button :class="[{'btn-main': isLockedWithdrawAvailable, 'btn-disabled': !isLockedWithdrawAvailable}, 'btn']" @click="claim">CLAIM</button>

                </span>
            </div>

        </div>
    </div>
</template>

<style>
    @font-face {
        font-family: Rajdhani;
        src: url(./assets/Rajdhani-Regular.ttf);
    }
    .box{
        margin: 40px;
        font-family: Rajdhani;
    }
    .warn{
        border: 3px solid #6a6a49;
        padding: 20px 13px;
        background-color: #eed0a8;
        margin-top: 12px;
        color: #42401a;
        font-family: Prompt;
        max-width: 600px;
    }
    .warn > button{
        position: relative;
        bottom: -9px;
        left: 340px;
    }
    .period{
        color:teal;
    }
</style>