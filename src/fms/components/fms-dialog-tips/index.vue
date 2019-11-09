<template>
  <div class="fms-dialog-tips" v-if="show">
    <dl :style="styleComputed">
      <dt class="fms-dialog-tips__title">{{title}}</dt>
      <dd class="fms-dialog-tips__content">
        <slot>{{content}}</slot>
      </dd>
      <dd class="fms-dialog-tips__btn">
        <slot name="btn">
          <kye-button type="primary" :disabled="btnDisabled" @click="btnClick">{{btnText}}</kye-button>
        </slot>
      </dd>
    </dl>
  </div>
</template>

<script>
  import { countDown } from '@/fms/utils'
  export default {
    props: {
      content: { type: String },
      count: { type: Number, default: 3 },
      title: { type: String, default: '提示' },
      width: { type: String, default: '320px' },
      storage: { type: String, default: '' }
    },
    computed: {
      show() {
        if (this.storage === 'sessionStorage' && sessionStorage.FMS_DIALOG_TIPS) {
          return false
        }
        if (this.storage === 'localStorage' && localStorage.FMS_DIALOG_TIPS) {
          return false
        }
        if (this.iknow) {
          return false
        }
        return true
      },
      styleComputed() {
        return `width: ${this.width}`
      }
    },
    data() {
      return {
        iknow: false,
        btnText: '我知道了',
        btnDisabled: true
      }
    },
    methods: {
      btnClick() {
        this.iknow = true
        if (this.storage === 'localStorage') {
          localStorage.FMS_DIALOG_TIPS = 1
        }
        if (this.storage === 'sessionStorage') {
          sessionStorage.FMS_DIALOG_TIPS = 1
        }
      }
    },
    created() {
      if (
        !this.storage ||
        (this.storage === 'localStorage' && !localStorage.FMS_DIALOG_TIPS) ||
        (this.storage === 'sessionStorage' && !sessionStorage.FMS_DIALOG_TIPS)
      ) {
        this.btnText = `我知道了(${this.count})`
        countDown(this.count, count => {
          this.btnText = `我知道了(${count})`
          if (count === 0) {
            this.btnText = '我知道了'
            this.btnDisabled = false
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  .fms-dialog-tips {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    dl {
      border-radius: 2px;
      background-color: #fff;
    }
    dt {
      color: #333;
      font-size: 14px;
      font-weight: bold;
      height: 32px;
      display: flex;
      padding: 2px 10px;
      align-items: center;
      border-bottom: 1px solid #c1bfc7;
    }
    dd {
      padding: 10px 10px;
    }
    dd:nth-of-type(1) {
      min-height: 80px;
      font-size: 13px;
    }
    dd:nth-of-type(2) {
      text-align: right;
      padding-top: 0;
    }
  }
</style>
