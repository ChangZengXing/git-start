<template>
  <fms-dialog :loading="loading" v-bind="fmsDialogOptions" v-on="$listeners">
    <fms-row>
      <kye-checkbox
        v-model="cushionFlag"
        label="代垫款开票"
        style="margin-right: 10px; line-height: 28px;"
        @change="cushionFlagUpdate"
      />
      <!-- 产品: 暂时隐藏 -->
      <!-- <kye-checkbox
        v-model="climbingFlag"
        label="爬楼费开票"
        style="margin-right: 10px; margin-left: 10px; line-height: 28px;"
        @change="climbingFlagUpdate"
      />-->
      <kye-button
        type="text"
        :auth="APICommon['invoice-searchPerson']"
        @click="openInvoiceNumDialog"
        icon="iconfont icon-fms-xuanzedanhao"
      >选择单号</kye-button>
      <kye-button
        type="text"
        :auth="APICommon['invoice-getCustomerList']"
        @click="openInvoiceDataDialog"
        icon="iconfont icon-fms-kaipiaoziliao"
      >开票资料</kye-button>
    </fms-row>
    <!-- 字段列表 -->
    <fms-form-block ref="form" :block="formBlock" :model="formModel"/>
    <!-- 散客 月结 table -->
    <kye-tabs v-model="tabType">
      <kye-tab-pane label="月结" name="0">
        <fms-table
          :maxHeight="300"
          :cols="tableCols[0]"
          :rows="tableRows['0']"
          :types="types"
          @addRow="addRow('0')"
          showAddBtnBottom
        >
          <template slot="invoiceUnAmount" slot-scope="{ row }">
            <kye-number
              :min="0"
              :max="row._max"
              :symbol="'¥'"
              :precision="2"
              :clearable="true"
              :disabled="row._disabled"
              placeholder="请输入开票金额"
              v-model="row.invoiceUnAmount"
              @input="updateInvoiceAmount"
            />
          </template>
          <template slot="operation" slot-scope="{ row, index }">
            <kye-button
              type="text"
              @click="modifyRow(0, row)"
              :disabled="index === 0 && invoiceType === '0'"
            >修改</kye-button>
            <kye-button type="text" @click="removeRow(0, row)" :disabled="!!row['__notCancel']">删除</kye-button>
          </template>
        </fms-table>
      </kye-tab-pane>
      <kye-tab-pane label="散客" name="1">
        <fms-table
          :maxHeight="300"
          :cols="tableCols[1]"
          :rows="personRows"
          :types="types"
          @sort-update="sortUpdate"
          @addRow="addRow('1')"
        >
          <template slot="invoiceUnAmount" slot-scope="{ row }">
            <kye-number
              :min="0"
              :max="row._max"
              :symbol="'¥'"
              :precision="2"
              :clearable="true"
              :disabled="row._disabled"
              placeholder="请输入开票金额"
              v-model="row.invoiceUnAmount"
              @input="updateInvoiceAmount"
            />
          </template>
          <template slot="operation" slot-scope="{ row }">
            <kye-button type="text" @click="removeRow(1, row)" :disabled="!!row['__notCancel']">删除</kye-button>
          </template>
        </fms-table>
        <fms-pagination :page="page" @change="pageChange" style="margin-top: 8px;"></fms-pagination>
      </kye-tab-pane>
    </kye-tabs>
    <!-- 弹框组件 -->
    <component :is="dialog.name" :ref="dialog.name" :args="dialog.args" @closed="dialogClosed"/>
  </fms-dialog>
</template>

<script>
  import mixins from './mixins'
  export default { mixins }
</script>
