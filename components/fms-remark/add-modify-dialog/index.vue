<template>
  <kye-dialog v-bind="dialog">
    <div style="position: relative">
      <kye-form label-position="right" :model="option" ref="form">
        <kye-form-item
          :label="option.label"
          prop="content"
          style="margin-bottom:0"
          :rules="{
                         required: true,
                         message: `${this.option.label}不能为空`,
                         trigger: 'blur'
                       }"
        >
          <kye-input
            type="textarea"
            rows="3"
            v-model="option.content"
            :placeholder="`请输入${option.label}`"
          ></kye-input>
        </kye-form-item>
      </kye-form>
    </div>
    <fms-form-footer @save="save" @cancel="close" in-dialog slot="footer"></fms-form-footer>
  </kye-dialog>
</template>

<script>
  import FmsFormFooter from '@/fms/components/fms-form-footer'
  import extend from '@/fms/utils/framework/extend'
  export default {
    data () {
      return {
        dialog: {
          title: '',
          width: '360px',
          visible: false,
          appendToBody: true,
          modalAppendToBody: true,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          beforeClose: this.close
        },
        option: {
          label: '',
          content: '',
          callback: null
        }
      }
    },
    components: {
      FmsFormFooter
    },
    methods: {
      async open (option, dialog) {
        extend(true, this.option, option)
        extend(true, this.dialog, dialog)
        this.dialog.visible = true
      },

      close () {
        this.$refs.form.clearValidate()
        this.$refs.form.resetFields()
        this.dialog.visible = false
      },

      async save () {
        this.$refs.form.validate(async valid => {
          if (valid) {
            if (typeof this.option.callback === 'function') {
              try {
                await this.option.callback(this.option.content)
                this.close()
              } catch (e) {
                console.error(e)
              }
            }
          }
        })
      }
    }
  }
</script>
