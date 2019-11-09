<template>
  <div class="fms-page-alert">
    <div
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-label="dialog"
      class="fms-alert-page-box__wrapper"
      style="z-index: 2002;"
    >
      <div class="el-message-box">
        <div class="el-message-box__header">
          <div class="el-message-box__title">
            {{title}}
            <span></span>
          </div>
          <button
            @click="onClick"
            type="button"
            aria-label="Close"
            class="el-message-box__headerbtn"
          >
            <i class="el-message-box__close el-icon-close"></i>
          </button>
        </div>
        <div class="el-message-box__content">
          <div class="el-message-box__status el-icon-warning"></div>
          <div class="el-message-box__message">
            <p>{{content}}</p>
          </div>
        </div>
        <div class="el-message-box__btns">
          <button
            @click="onClick"
            type="button"
            class="el-button el-button--default el-button--small el-button--primary"
          >
            <span>确定</span>
          </button>
        </div>
      </div>
    </div>
    <div class="fms-alert-model"></div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String,
      content: String
    },
    methods: {
      onClick() {
        this.$emit('close')
      }
    }
  }
</script>

<style lang="scss">
  .fms-page-alert {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    .fms-alert-page-box__wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .fms-alert-model {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      z-index: 1;
      opacity: 0.5;
      background: #000;
    }
  }
</style>
