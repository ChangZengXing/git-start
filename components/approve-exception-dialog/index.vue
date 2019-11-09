<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-form-block :block="searchBlock" :model="searchModel">
      <fms-form-items
        slot-scope="{ props }"
        slot="inMonth-payDate-handInDate"
        :items="props.col.items"
        v-model="searchModel['inMonth-payDate-handInDate']"
      />
      <fms-form-button slot="searchBtn" @search="onSearch"/>
    </fms-form-block>
    <!-- 功能按钮 -->
    <fms-row>
      <kye-button
        type="text"
        @click="onExceptionAproveExecute"
        :auth="exceptionApproveExecuteAuth"
        icon="iconfont icon-fms-zhihangyichangshenhe"
      >执行异常审核</kye-button>
      <kye-button
        type="text"
        @click="onExceptionApproveCancle"
        :auth="exceptionApproveCancleAuth"
        icon="iconfont icon-fms-quxiaoyichangshenhe"
      >取消异常审核</kye-button>
      <kye-button
        type="text"
        @click="onExport"
        :auth="exportAuth"
        icon="iconfont icon-export"
      >导出</kye-button>
      <fms-data-rows :data="dataRows" inline></fms-data-rows>
    </fms-row>
    <fms-table
      :cols="tableCols"
      :rows="tableRows"
      :types="{ selection: true }"
      @row-selection="onTabelRowSelection"
    />
    <!-- 翻页 -->
    <!-- <fms-pagination slot="footer" :page="page" @change="pageChange"/> -->
  </fms-dialog>
</template>

<script>
  import comMixins from '@/fms/mixins/common'
  import tableCols from './model/table-cols'
  import searchBlock from './model/search-block'
  import APIMonthly from '@/fms/api/monthly-receivable'
  import APIPerson from '@/fms/api/personally-receivable'
  import {
    cacheHttpNext,
    initGenericAsync,
    initGenericArgs,
    createModelByBlock
  } from '@/fms/utils'
  import { cloneDeep } from 'lodash'
  export default {
    mixins: comMixins,
    data() {
      return {
        loading: false,
        fmsDialogOptions: {
          title: '允许异常审核',
          width: '1200px'
        },
        dataRows: {
          model: { exceptionAmount: '0' },
          items: [{ label: '允许异常总额', key: 'exceptionAmount', filter: 'money' }]
        },
        tableCols: [],
        tableRows: [],
        searchArgs: {},
        searchType: 0,
        searchBlock: {},
        searchModel: {},
        tableSelectedRowIds: [],
        generic: {},
        genericArgs: {},
        configCodes: {
          monthly: {
            statis: APIMonthly['monthlyExceptionPermissionApproveStatis'],
            search: APIMonthly['monthlyExceptionPermissionApproveSearch'],
            queryCode: APIMonthly['monthlyExceptionPermissionApproveSearch-query-code'],
            columnCode: APIMonthly['monthlyExceptionPermissionApproveSearch-field-code'],
            searchCode: APIMonthly['monthlyExceptionPermissionApproveSearch-search-code'],
            exceptionApproveCancle: APIMonthly['billBase-monthlyExceptionApproveCancle'],
            exceptionApproveExecute: APIMonthly['billBase-monthlyExceptionApproveExecute'],
            export: APIMonthly['monthlyExceptionPermissionApproveSearchExport']
          },
          personally: {
            statis: APIPerson['personExceptionPermissionApproveStatis'],
            search: APIPerson['personExceptionPermissionApproveSearch'],
            queryCode: APIPerson['personExceptionPermissionApproveSearch-query-code'],
            columnCode: APIPerson['personExceptionPermissionApproveSearch-field-code'],
            searchCode: APIPerson['personExceptionPermissionApproveSearch-search-code'],
            exceptionApproveCancle: APIPerson['billBase-personExceptionApproveCancle'],
            exceptionApproveExecute: APIPerson['billBase-personExceptionApproveExecute'],
            export: APIPerson['personBill-personExceptionPermissionApproveSearchExport']
          }
        },
        totalRows: '', // 总条数
        exceptionApproveCancleAuth: undefined,
        exceptionApproveExecuteAuth: undefined,
        exportAuth: undefined
      }
    },
    methods: {
      async open(dialogParams) {
        this.fmsDialogOpen(dialogParams)
        const { type } = dialogParams
        console.log('type===', type)
        this.searchBlock = searchBlock(this, type)
        this.searchModel = createModelByBlock(this.searchBlock)
        this.tableCols = tableCols(this, type)
        const {
          queryCode,
          columnCode,
          searchCode,
          exceptionApproveCancle,
          exceptionApproveExecute,
          export: exportAuth
        } = this.configCodes[type]
        this.generic = await initGenericAsync({
          queryCode,
          columnCode,
          searchCode,
          formModel: this.searchModel
        })
        this.exceptionApproveCancleAuth = exceptionApproveCancle
        this.exceptionApproveExecuteAuth = exceptionApproveExecute
        this.exportAuth = exportAuth
        console.log('this.generic', this.generic)
      },
      async loadTableRows(cache = true) {
        const { type } = this.dialogParams
        try {
          this.genericArgs.pageSize = 1000
          console.error(this.genericArgs)
          this.loading = true
          const { rows = [], rowTotal = 0, pageTotal } = await cacheHttpNext(
            this.configCodes[type].search,
            this.genericArgs,
            cache
          )
          if (pageTotal > 1) {
            return this.$message.warning('查询数据超过一千条,数据量过大,请增加查询条件!')
          }
          this.tableRows = rows
          this.totalRows = rowTotal
          this.$$setPageTotal(rowTotal)

          // 执行统计 允许异常总额
          const res = await this.$http(this.configCodes[type].statis, this.genericArgs)
          Object.assign(this.dataRows.model, res)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      pageChange(type, val, cache) {
        this.$$pageChange(type, val, this.genericArgs, () => this.loadTableRows(cache))
      },
      onTabelRowSelection(rows) {
        this.tableSelectedRowIds = rows.map(row => row.id)
      },
      async onSearch() {
        let vo = cloneDeep(this.searchModel)
        const { key, value } = this.searchModel['inMonth-payDate-handInDate'] || {}
        vo[key] = value
        delete vo['inMonth-payDate-handInDate']
        this.genericArgs = initGenericArgs(this.generic, vo)
        if (this.genericArgs.generic.vos.length < 2) {
          return this.$message.warning('至少要有2个查询条件!')
        }
        // 当异常有无审核= 无时,查出无和空的状态
        this.genericArgs.generic.vos.map(item => {
          if (item.columnName === 'bill.exception_status' && item.values[0] === 'No') {
            item.operation = 'not_equal'
            item.values[0] = 'Yes'
          }
        })
        this.$$updatePage(1, this.genericArgs, () => this.loadTableRows(false))
      },
      // 执行异常审核
      async onExceptionAproveExecute() {
        try {
          if (this.tableSelectedRowIds.length === 0) {
            return this.$message.warning('请先勾选数据')
          }
          this.loading = true
          await this.$http(this.exceptionApproveExecuteAuth, {
            ids: this.tableSelectedRowIds
          })
          this.$message.success('操作成功')
          // ES有写入延迟, 这里延迟执行查询
          setTimeout(() => {
            this.$$updatePage(1, this.genericArgs, () => this.loadTableRows(false))
          }, 2000)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      // 取消异常审核
      async onExceptionApproveCancle() {
        try {
          if (this.tableSelectedRowIds.length === 0) {
            return this.$message.warning('请先勾选数据')
          }
          this.loading = true
          await this.$http(this.exceptionApproveCancleAuth, {
            ids: this.tableSelectedRowIds
          })
          this.$message.success('操作成功')
          // ES写入延迟, 这里延迟执行查询
          setTimeout(() => {
            this.$$updatePage(1, this.genericArgs, () => this.loadTableRows(false))
          }, 2000)
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      isShow() {
        return this.$route.path.includes('/monthly-receivable/')
      },
      // 导出
      onExport() {
        const { type } = this.dialogParams
        this.commonExport({
          usingQueryTable: false,
          dataList: this.tableRows,
          method: this.configCodes[type].export,
          searchCode: this.configCodes[type].columnCode,
          params: this.genericArgs,
          total: this.totalRows
        })
      }
    }
  }
</script>
