<template>
  <kye-dialog v-bind="dialog">
    <fms-dialog-loading :loading="loading"></fms-dialog-loading>
    <div v-if="!option.detail">
      <kye-button type="text" @click="onAdd">
        <i class="iconfont icon-plus"></i>新增
      </kye-button>
      <kye-button type="text" @click="onRemove">
        <i class="iconfont icon-delete"></i>删除
      </kye-button>
    </div>
    <div>
      <kye-table
        :data="dataList"
        style="margin-top:4px;"
        @row-click="rowClickedHandle"
        highlight-current-row
      >
        <kye-table-column width="50px" type="index" fixed="left"></kye-table-column>
        <kye-table-column
          v-for="(col, i) in option.columns"
          :key="col.id || i"
          :type="col.type"
          :label="col.label"
          :width="col.width || '150px'"
          :fixed="col.fixed || false"
          :align="col.align || 'center'"
          :min-width="col.minWidth || col.width || '120px'"
          :show-overflow-tooltip="col.tips || false"
        >
          <span slot-scope="scope">{{getFieldValue(scope.row, col)}}</span>
        </kye-table-column>
        <!-- 如果是修改,那么生成吸怪和删除按钮 -->
        <kye-table-column width="170px" label="操作" align="center" fixed="right">
          <template slot-scope="scope">
            <kye-button type="text" :disabled="option.detail" @click="onModify(scope.row)">修改</kye-button>
          </template>
        </kye-table-column>
      </kye-table>
    </div>

    <!-- 新增修改弹窗 -->
    <add-modify-dialog ref="addModifyDialog"></add-modify-dialog>

    <!-- 底部按钮 -->
    <!-- <div slot="footer"
         v-if="!option.detail">
      <fms-form-footer @save="onAdd"
                       save-label="新增"
                       @cancel="close"
                       in-dialog>
      </fms-form-footer>
    </div>-->
  </kye-dialog>
</template>
<script>
  import AddModifyDialog from './add-modify-dialog'
  import FmsDialogLoading from '@/fms/components/fms-dialog-loading'
  import extend from '@/fms/utils/framework/extend'
  import trim from '@/fms/utils/framework/trim'
  import { get } from 'lodash'

  const methods = {
    load: null,
    add: null,
    disable: null,
    modify: null
  }

  export default {
    components: {
      AddModifyDialog,
      FmsDialogLoading
    },
    /**
     * 默认数据
     * @param {Object} dialog - 弹窗
     * @param {Boolean} loading - 是否处于加载中
     * @param {Array} dataList - 数据列表
     * @param {Object} option - 附加参数
     *   @property {Boolean} detail - 是否属于详情页
     *   @property {String} key - 需要操作的列.必须传递.
     *   @property {Array} columns - 列配置
     *   @property {Function|Array} load - 加载数据的方法,或者数据信息
     *   @property {Function|String} add - 新增请求的方法名称或方法
     *   @property {Function|String} disable - 删除时请求的方法名称或方法
     *   @property {Function|String} modify - 编辑时操作的方法或方法
     *   @property {Function} callback - 点击关闭按钮时的处理
     * @param {Object} selectedRow - 选择的行信息
     */
    data() {
      return {
        dialog: {
          title: '备注',
          width: '1200px',
          visible: false,
          appendToBody: false,
          modalAppendToBody: true,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          beforeClose: this.close
        },
        option: Object.assign({}, methods, {
          key: '',
          columns: [],
          detail: false,
          callback: null
        }),
        loading: false,
        dataList: [],
        column: null,
        selectedRow: null
      }
    },
    methods: {
      /**
       * 数据校验
       * @param {Object} option - 备注参数
       */
      _beforeValidate(option) {
        if (!option) {
          throw new Error('option不能为空')
        }

        let interfaces = option.detail
          ? {
              load: null
            }
          : methods
        Object.keys(interfaces).forEach(method => {
          if (!option[method]) {
            console.error(method)
            throw new Error(`${method}不能为空`)
          }
        })

        if (!Array.isArray(option.columns) || !option.columns.length) {
          throw new Error('columns必须为数组且不能为空数组')
        }

        let key = trim(option.key)
        if (!key) {
          throw new Error('key不能为空')
        }

        let column = null
        for (let property of option.columns) {
          if (property.key === key) {
            column = property
            break
          }
        }

        if (!column) {
          throw new Error('key必须在columns中存在')
        }

        option.key = key
        this.column = column
        extend(true, this.option, option)
      },
      /**
       * 打开窗口
       * @param {Object} dialog - 弹出窗参数信息
       * @param {Object} option - 备注参数
       */
      async open(dialog = {}, option = {}) {
        this._beforeValidate(option)

        extend(true, this.dialog, dialog)
        this.dialog.visible = true
        this.loadData()
      },
      /**
       * 加载数据信息
       * @description
       * 1、会根据传递过来的load方法按需处理
       */
      async loadData() {
        const load = this.option.load
        try {
          this.loading = true
          let dataList = []

          // 如果本身是一个数组,那么直接赋值即可
          if (Array.isArray(load)) {
            dataList = load
          } else if (typeof load === 'function') {
            dataList = await load()
          }

          this.dataList = Array.isArray(dataList) ? dataList : []
        } catch (e) {
          console.error(e)
          this.dataList = []
        } finally {
          this.loading = false
        }
      },
      /**
       * 删除数据
       * @description 会根据传递过来的disable属性进行处理
       * 1、如果是字符串,那么认为是请求的方法.
       * 2、如果是方法,那么认为是自定义处理
       */
      async onRemove() {
        if (!this.selectedRow) {
          this.$message.warning('请选择需要删除的数据!')
          return
        }

        await this.$confirm('此操作将永久删除该数据, 是否继续?', '提示')

        let disabled = this.option.disable
        try {
          this.loading = true
          if (typeof disabled === 'function') {
            await disabled(this.selectedRow)
          } else if (typeof disabled === 'string') {
            disabled = trim(disabled)
            if (disabled) {
              await this.$http(disabled, {
                id: this.selectedRow.id
              })
            }
          } else {
            throw new Error(`无效的disable属性!${disabled}`)
          }

          this.$message.success('删除成功!')
          this.loadData()
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      /**
       * 进入修改界面
       */
      onModify(row) {
        this.$refs.addModifyDialog.open(
          {
            label: this.column.label,
            content: row[this.option.key],
            callback: content => {
              console.error(content, row)
              this.modifyHandle(content, row)
            }
          },
          {
            title: `${this.dialog.title}修改`
          }
        )
      },
      /**
       * 进入新增界面
       */
      onAdd() {
        this.$refs.addModifyDialog.open(
          {
            label: this.column.label,
            callback: content => {
              this.addHandle(content)
            }
          },
          {
            title: `${this.dialog.title}新增`
          }
        )
      },
      /**
       * 关闭窗口的处理
       * @description 如果有传入callback.那么会将dataList传入
       */
      close() {
        this.dialog.visible = false
        if (typeof this.option.callback === 'function') {
          this.option.callback()
        }
      },
      /**
       * 新增处理
       * @param {String} content - 输入的内容
       */
      async addHandle(content) {
        if (typeof this.option.add === 'function') {
          try {
            this.loading = true
            await this.option.add(content)
            this.$message.success('新增成功!')
            this.loadData()
          } catch (e) {
            console.error(e)
          } finally {
            this.loading = false
          }
        }
      },
      /**
       * 修改处理
       * @param {String} content - 当前内容
       * @param {Object} row - 行信息
       */
      async modifyHandle(content, row) {
        if (typeof this.option.modify === 'function') {
          try {
            this.loading = true
            await this.option.modify(content, row)
            this.$message.success('修改成功!')
            this.loadData()
          } catch (e) {
            console.error(e)
          } finally {
            this.loading = false
          }
        }
      },
      /**
       * 获取指定字段的值
       * @param {Object} row - 当前行的数据信息
       * @param {Object} field - 字段信息
       */
      getFieldValue(row, field) {
        if (!row || !field) {
          return ''
        }

        if (field.hasOwnProperty('value')) {
          return typeof field.value === 'function' ? field.value(row) : field.value
        }

        const key = trim(field.key)
        if (key) {
          const value = get(row, key) || field.default
          return this.filterField(value, field.filter)
        }
        return ''
      },
      /**
       * 数据过滤
       * @param {mixed} val - 值
       * @param {String} filter - 过滤器
       */
      filterField(val, filter) {
        if (filter) {
          if (filter.type && filter.args) {
            let func = this.$filter[filter.type]
            if (func) {
              return func(val, ...filter.args)
            }
            return val
          } else {
            let func = this.$filter[filter]
            if (func) {
              return func(val)
            }
            return val
          }
        }
        return val
      },
      /**
       * 行点击事件的处理
       * @date 2018-08-29 16:03:11
       * @author xuzengqiang
       * @since 1.0.1
       */
      rowClickedHandle(row) {
        this.selectedRow = row
      }
    }
  }
</script>
