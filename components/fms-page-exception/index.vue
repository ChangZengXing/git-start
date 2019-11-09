<template>
  <div class="fms-page-exception">
    <div class="fms-page-exception-box">
      <el-alert title type="error" :closable="false">
        <dl>
          <dt>{{msg || '接口请求出错了!'}}</dt>
          <dd>
            <kye-button @click="next(-1)">上一条</kye-button>
            <kye-button @click="next(1)">下一条</kye-button>
          </dd>
        </dl>
      </el-alert>
    </div>
    <div class="fms-page-exception-modal"></div>
  </div>
</template>

<script>
  export default {
    props: {
      msg: { type: String, default: '接口请求出错了!' }
    },
    methods: {
      next(type) {
        this.$emit('next', type)
      }
    }
  }
</script>

<style lang="scss">
  .fms-page-exception {
    position: absolute;
    bottom: 0;
    left: -12px;
    right: -12px;
    top: 40px;
    // display: grid;
    display: flex;
    // align-content: center;
    justify-content: center;
  }
  .fms-page-exception-box {
    margin-top: 70px;
    position: relative;
    z-index: 3;
    max-width: 748px;
    min-width: 300px;
    .el-alert {
      padding: 16px;
      display: flex;
      justify-content: center;
      background-color: #fff;
    }
    .el-alert__content {
      display: block;
      padding: 0;
    }
    dt {
      font-size: 14px;
      margin-bottom: 12px;
    }
    dl {
      text-align: center;
    }
    dd {
      display: flex;
      justify-content: center;
    }
  }
  .fms-page-exception-modal {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    z-index: 1;
    opacity: 0.5;
    background: #000;
  }
</style>
