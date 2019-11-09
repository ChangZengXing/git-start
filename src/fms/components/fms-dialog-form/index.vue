<template>
  <fms-dialog
    class="fms-dialog-form"
    :loading="loading"
    :loadingText="loadingText"
    v-bind="fmsDialogOptions"
    v-on="$listeners"
  >
    <!-- 表单 -->
    <fms-form-block
      v-if="form.block  || formBlock.rows"
      :block="form.block || formBlock"
      :model="form.model || formModel"
      v-bind="form.props || formProps"
      ref="form"
    />
    <fms-form-grid
      v-else
      :grid="form.grid || formGrid"
      :model="form.model || formModel"
      v-bind="form.props || formProps"
      ref="form"
    />
    <!-- 操作按钮 -->
    <fms-row v-if="btns.length > 0">
      <kye-button
        v-for="btn in btns"
        :key="btn.lable"
        v-bind="btn.props"
        v-on="btn.listeners"
      >{{btn.lable}}</kye-button>
    </fms-row>
    <!-- 数据统计 -->
    <fms-data-rows v-if="dataRows.items" :data="dataRows" />
    <!-- 数据表格 -->
    <fms-table
      v-if="table.cols"
      :cols="table.cols"
      :rows="table.rows"
      v-bind="table.props"
      v-on="table.listeners"
      style="margin-bottom: 16px;"
    />
    <!-- 翻页 -->
    <fms-pagination
      v-if="dialogParams.onPageChange || page.change"
      slot="footer"
      :page="page"
      @change="pageChange"
    />
    <!-- 弹窗组件 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed" />
  </fms-dialog>
</template>

<script>
  import FmsDialogForm from './'
  import FmsRow from '@/fms/components/fms-row'
  import FmsTable from '@/fms/components/fms-table'
  import FmsRender from '@/fms/components/fms-render'
  import FmsDialog from '@/fms/components/fms-dialog'
  import FmsFormGrid from '@/fms/components/fms-form-grid'
  import FmsDataRows from '@/fms/components/fms-data-rows'
  import FmsFormBlock from '@/fms/components/fms-form-block'
  import FmsPagination from '@/fms/components/fms-pagination'
  import FmsDialogAlert from '@/fms/components/fms-dialog-alert'
  import FmsDialogImage from '@/fms/components/fms-dialog-image'
  import FmsDialogConfirm from '@/fms/components/fms-dialog-confirm'
  import dialogMixins from '@/fms/mixins/dialog'
  import fmsDialogMixins from '@/fms/mixins/fms-dialog'
  import paginationMixins from '@/fms/mixins/pagination'
  import { cloneDeep } from 'lodash'
  export default {
    name: 'FmsDialogForm',
    mixins: [fmsDialogMixins, paginationMixins, dialogMixins],
    components: {
      FmsRow,
      FmsTable,
      FmsDialog,
      FmsRender,
      FmsDataRows,
      FmsFormGrid,
      FmsFormBlock,
      FmsDialogForm,
      FmsPagination,
      FmsDialogAlert,
      FmsDialogImage,
      FmsDialogConfirm
    },
    data() {
      return {
        fmsDialogOptions: {
          width: 4,
          submitText: '保存',
          submitCall: this.dialogSubmit,
          cancelCall: this.dialogCancel,
          beforeClose: this.dialogCancel
        },
        page: {},
        btns: [],
        form: {},
        table: {},
        dataRows: {},
        formGrid: {},
        formBlock: {},
        formModel: {},
        formProps: {},
        callbackParams: () => ({
          page: this.page,
          form: this.form,
          table: this.table,
          model: this.form.model || this.formModel,
          dataRows: this.dataRows,
          dialog: {
            open: this.dialogOpen.bind(this),
            close: this.fmsDialogClose.bind(this),
            loading: this.dialogLoading.bind(this)
          }
        })
      }
    },
    methods: {
      open(dialogParams) {
        this.fmsDialogOpen(dialogParams)

        const {
          width,
          onOpen,
          formGridFn,
          formBlockFn,
          formModelFn,
          page = {},
          form = {},
          table = {},
          dataRows = {},
          formGrid = {},
          formModel = {},
          formBlock = {},
          formProps = {},
          modelClone = true,
          dialogOptions = {}
        } = dialogParams

        width && (this.fmsDialogOptions.width = width)

        if (page.change || dialogParams.onPageChange) {
          this.fmsDialogOptions.submitCall = undefined
          this.fmsDialogOptions.cancelCall = undefined
        }

        Object.assign(this.page, page)
        Object.assign(this.fmsDialogOptions, dialogOptions)
        this.form = modelClone ? cloneDeep(form) : form
        this.table = cloneDeep(table)
        this.dataRows = cloneDeep(dataRows)
        this.formGrid = cloneDeep(formGrid)
        this.formModel = modelClone ? cloneDeep(formModel) : formModel
        this.formBlock = cloneDeep(formBlock)
        this.formProps = cloneDeep(formProps)

        this.form.ref = this.$refs.form

        if (formGridFn) {
          this.formGrid = formGridFn.call(this, this)
        }

        if (formBlockFn) {
          this.formBlock = formBlockFn.call(this, this)
        }

        if (formModelFn) {
          this.formModel = formModelFn.call(this, this)
        }

        onOpen && onOpen(this.callbackParams())

        // TODO: 由于组件会自动挂载 这里返回promise,会有点麻烦
        // return new Promise((resolve, reject) => {  })
      },
      dialogLoading(loading = true) {
        this.loading = !!loading
        if (typeof loading !== 'string') {
          this.loadingText = ''
        } else {
          this.loadingText = loading
        }
      },
      dialogCancel() {
        this.fmsDialogClose()
        const { onCancel } = this.dialogParams
        onCancel && onCancel(this.callbackParams())
      },
      dialogSubmit() {
        // 验证
        this.$refs.form
          .validate()
          .then(() => {
            if (this.dialogParams.onSubmit) {
              this.dialogParams.onSubmit(this.callbackParams())
            }
          })
          .catch(e => console.warn(e))
      },
      pageChange(type, val) {
        this.page[type] = val
        if (this.dialogParams.onPageChange) {
          this.dialogParams.onPageChange(this.callbackParams())
        }
        if (this.page.change) {
          this.page.change(this.callbackParams())
        }
      }
    }
  }
</script>

<style lang="scss">
  .fms-dialog-form {
    .el-dialog__body {
      padding-bottom: 0;
    }
  }
</style>
