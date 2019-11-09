<!--
@fileOverview fms-form-fields 调试组件
@author xuzengqiang
@date 2018-06-13 21:45:27
-->
<template>
  <kye-form :model="model">
    <fms-form-fields :layout="layout"
                     :model="model">
      <kye-input slot="remark"
                 placeholder="请输入备注信息">
      </kye-input>
      <kye-image slot="image-preview"
                 :config="{
          width: '100%',
          height: 490,
          imgSrc: 'https://miao.su/images/2018/04/12/_u107209b5c6.png'
        }" />
      <kye-input slot="tried-setting"
                 placeholder="疲劳值设定">
      </kye-input>
      <kye-input slot="paymentDetail">

      </kye-input>
    </fms-form-fields>
  </kye-form>
</template>
<script>
  import FmsFormFields from '../index'
  import layout from './layout'
  export default {
    data () {
      return {
        model: {},
        layout: layout(this)
      }
    },
    components: {
      FmsFormFields
    }
  }
</script>
