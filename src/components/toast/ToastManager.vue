<template>
  <div>
    <div class="toast-container">
      <div v-for="(item, index) in toastList" :key="index">
        <div class="toast alarm" v-if="item.type === 'ticketMessage'" :class="getAlarmClassList(item)">
          <span class="text" style="margin-left: 15px;" :title="item.message.content">{{ item.message.content }}</span>
          <i @click="deleteToast($event, item)" style="position: absolute; right: 15px; top: 18px; cursor: pointer;" class="el-alert__closebtn el-icon-close" ></i>
        </div>
        <div class="toast alarm" v-if="item.type === 'alarmMessage'" :class="getAlarmClassList(item)">
          <span class="icon">
            <i class="icon-zhaoshengbaobiao"></i>
          </span>
          <span class="text" :title="item.message.content">{{ item.message.content }}</span>
          <i @click="deleteToast($event, item)" style="position: absolute; right: 15px; top: 18px; cursor: pointer;" class="el-alert__closebtn el-icon-close"></i>
        </div>
        <div v-if="item.type !== 'ticketMessage' && item.type !== 'alarmMessage'" class="toast" :class="getClass(item)">
          <!-- <div v-for="item in toastList" class="toast success"> -->
          <span class="icon"></span>
          <span class="text" :title="$t(item.action, { name: `'${item.name}'` })" v-if="item.count === 1 && item.name !== undefined">{{ $t(item.action, { name: `"${item.name}"` }) }}</span>
          <span class="text" :title="$t(item.action, { name: '' })" v-if="item.count > 1 || item.name === undefined">
            <span style="width: 120px;">{{ $t(item.action, { name: '' }) }}</span>
            <span v-if="item.resultType === 'success'">成功 {{ item.count }}</span>
            <span v-if="item.resultType === 'fail'">失败 {{ item.count }}</span>
         </span>
          <!--<img @click="deleteToast($event, item)" style="position: absolute; right: 15px; top: 18px; cursor: pointer;" src="~assets/close.svg" />-->
          <span style="position: absolute;top:0;right: 15px;">
               <i @click="deleteToast($event, item)" class="el-alert__closebtn el-icon-close" style="color: #ccc;font-size:16px"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import VueMixins from '@src/mixins/VuexMixins';
  import { stopEvent} from '@libs/utils';
  /* eslint no-unused-vars: ["error", { "varsIgnorePattern": ".*" }] */

  export default {
    name: 'ToastManager',
    mixins: [VueMixins],
    data: function () {
      return {

      }
    },
    methods: {
      getAlarmClassList (item) {
        let obj = {}
        if (item.message.ALARM_CURRENT_STATUS) {
          if (item.message.ALARM_CURRENT_STATUS === 'OK') {
            obj['success'] = true
          } else if (item.message.ALARM_CURRENT_STATUS !== 'OK') {
            obj['other'] = true
          }
        } else if (item.message.EVENT_EMERGENCY_LEVEL) {
          if (item.message.EVENT_EMERGENCY_LEVEL === 'Emergent') {
            obj['fail'] = true
          } else if (item.message.EVENT_EMERGENCY_LEVEL === 'Normal') {
            obj['other'] = true
          } else {
            obj['other'] = true
          }
        } else if (item.message.ticket) {
          if (item.message.status === 'Pending') {
            obj['running'] = true
          } else if (item.message.status === 'FinalApproved') {
            obj['success'] = true
          } else if (item.message.status === 'Rejected') {
            obj['fail'] = true
          }
        }
        return obj
      },
      getClass (item) {
        let obj = { 'running': (item.successCount + item.failCount) < item.count, 'success': item.successCount === item.count || item.resultType === 'success', 'fail': item.failCount === item.count || item.resultType === 'fail', 'other': (item.successCount + item.failCount) >= item.count && item.failCount !== item.count && item.successCount !== item.count }
        return obj
      },
      deleteToast: function ($event, item) {
        this.destroyToast(item.id);
        stopEvent($event);
      },
    },
    computed: {
      toastList: function () {
        let list = []
        Object.keys(this.$store.state.toastManager.toasts).forEach(_id => {
          list.push(this.$store.state.toastManager.toasts[_id])
        })
        list.sort((a, b) => {
          return a.time - b.time
        })
        return list
      }
    }
  }
</script>

<style scoped>
  .toast-container {
    position: absolute;
    z-index: 6000;
    top: 60px;
    width: 300px;
    right: 10px;
    /*bottom: 0px;*/
  }

  .toast {
    position: relative;
    font-size: 14px;
    color: #1A2736;
    height: 54px;
    line-height: 54px;
    /*text-align: center;*/
    margin-top: 10px;
    border-radius: 2px;
    cursor: pointer;
  }

  .toast .icon {
    position: absolute;
    display: block;
    left: 18px;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
  }

  .toast .text {
    display: block;
    margin-left: 60px;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toast.alarm {
    border: 1px solid rgb(255, 70, 76);
    background-color: #FFFCFC;
    border-left: 2px solid yellow;
  }

  .toast.alarm.other {
    border: 1px solid rgb(255, 70, 76);
    background-color: #FFFCFC;
    border-left: 2px solid yellow;
  }

  .toast.alarm .icon .icon-zhaoshengbaobiao {
    display: inline-block;
    font-size: 25px;
    color: #f36a2f;
  }

  .toast.alarm.other .icon{
    background-image: none;
  }

  .toast.alarm.other .icon .icon-zhaoshengbaobiao{
    display: inline-block;
    font-size: 25px;
    color: #f36a2f;
  }

  .toast.alarm .icon{
    width: 100%;
    height: 100%;
    display: inline-block;
    vertical-align: middle;
    line-height: 30px;
  }

  .toast.alarm .other{
    width: 100%;
    height: 100%;
    display: inline-block;
    vertical-align: middle;
  }

  .toast.success {
    border: 1px solid rgba(69,187,121,0.30);
    background-color: #1a3aff;
    opacity: 0.5;
    color: #fff;
  }

  .success .icon {
    top: 17px;
    height: 20px;
    width: 20px;
    background-image: url('~@images/notification_success.svg');
    animation: none;
  }

  .toast.running {
    border: 1px solid #ABD8FA;
    background-color: #F5FBFF;
    opacity: 0.5;
  }

  .running .icon {
    top: 18px;
    height: 18px;
    width: 20px;
    border-radius: 100%;
    background-image: url('~@images/notification_running.svg');
    animation:run 2s linear infinite;
    background-repeat: no-repeat;
  }

  @keyframes run {
    　from {
      transform:rotate(0deg);
    } to {
        transform:rotate(360deg);
      }
  }

  .toast.fail {
    border: 1px solid #f7a138;
    background-color: #f7a138;
    color: #fff;
  }

  .fail .icon {
    top: 17px;
    height: 20px;
    width: 20px;
    background-image: url('~@images/notification_error.svg');
  }

  .toast.other {
    border: 1px solid #FFD883;
    background-color: #FFFBF4;
  }

  .other .icon {
    top: 17px;
    height: 20px;
    width: 20px;
    background-image: url('~@images/notification_warning.svg');
  }

</style>
