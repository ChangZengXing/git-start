<template>
  <div class="fms-form-fields-component">
    <el-row
      v-for="(row, index) in layout"
      class="form-fields-row"
      :key="`row-${index}`"
      :gutter="20"
    >
      <column-title :label="row.title"></column-title>
      <el-col
        v-for="(column, columnindex) in row.cols"
        class="form-fields-column"
        :key="`column-${columnindex}`"
        :span="getSpan(row.cols, column)"
        :style="'padding:0;' + (column.gap ? `padding-right: ${column.gap}px` : '')"
      >
        <column-title :label="column.title"></column-title>
        <template v-if="column.slot">
          <slot :name="column.slot"></slot>
        </template>
        <!-- 如果有子节点,表示该子栏目下有很多列 -->
        <el-row
          v-if="isArray(column.childrens)"
          class="form-fields-column-children"
          v-for="(children, childrenindex) in column.childrens"
          :key="`column-children-${childrenindex}`"
        >
          <column-title :label="children.title"></column-title>
          <slot v-if="children.slot" :name="children.slot"></slot>
          <kye-tabs v-if="isArray(children.tabs)">
            <kye-tab-pane
              v-for="(tab, tabindex) in children.tabs"
              :key="`tab-${tabindex}`"
              :label="tab.label"
            >
              <slot v-if="tab.slot" :name="tab.slot"/>
              <template v-if="isArray(tab.fields)">
                <component
                  :is="renderComponent"
                  :model="model"
                  :column="tab.column"
                  :fields="tab.fields"
                >
                  <template v-for="slot in getSlots(tab.fields)" :slot="slot">
                    <slot :name="slot"></slot>
                  </template>
                </component>
              </template>
              <!-- 如果还有子节点,不支持tab下面还有tab,所以直接遍历即可 -->
              <kye-row
                v-else-if="tab.childrens && tab.childrens.length"
                v-for="(tabchildren, tabChildrenIndex) in tab.childrens"
                :key="'tabchildren-' + tabChildrenIndex"
              >
                <column-title :label="tabchildren.title"></column-title>
                <slot v-if="tabchildren.slot" :name="tabchildren.slot"></slot>
                <template v-if="isArray(tabchildren.fields)">
                  <!-- 组件预览拆分 -->
                  <component
                    :is="renderComponent"
                    :model="model"
                    :column="tabchildren.column"
                    :fields="tabchildren.fields"
                  >
                    <!-- 插槽继承 -->
                    <template v-for="slot in getSlots(tab.fields)" :slot="slot">
                      <slot :name="slot"></slot>
                    </template>
                  </component>
                </template>
              </kye-row>
            </kye-tab-pane>
          </kye-tabs>

          <!-- 判断是否有fields -->
          <template v-if="isArray(children.fields)">
            <component
              :is="renderComponent"
              :model="model"
              :column="children.column"
              :fields="children.fields"
            >
              <!-- 插槽继承 -->
              <template v-for="slot in getSlots(children.fields)" :slot="slot">
                <slot :name="slot"></slot>
              </template>
            </component>
          </template>
        </el-row>

        <!-- 判断是否有tabs,则表示有选项卡,选项卡下面不生成标题 -->
        <kye-tabs v-if="isArray(column.tabs)">
          <kye-tab-pane
            v-for="(tab, tabindex) in column.tabs"
            :key="`tab-${tabindex}`"
            :label="tab.label"
          >
            <slot v-if="tab.slot" :name="tab.slot"/>
            <template v-if="isArray(tab.fields)">
              <!-- 组件预览拆分 -->
              <component
                :is="renderComponent"
                :model="model"
                :column="tab.column"
                :fields="tab.fields"
              >
                <!-- 插槽继承 -->
                <template v-for="slot in getSlots(tab.fields)" :slot="slot">
                  <slot :name="slot"></slot>
                </template>
              </component>
            </template>
            <!-- 如果还有子节点,不支持tab下面还有tab,所以直接遍历即可 -->
            <kye-row
              v-else-if="tab.childrens && tab.childrens.length"
              v-for="(tabchildren, tabChildrenIndex) in tab.childrens"
              :key="'tabchildren-' + tabChildrenIndex"
            >
              <column-title :label="tabchildren.title"></column-title>
              <slot v-if="tabchildren.slot" :name="tabchildren.slot"></slot>
              <template v-if="isArray(tabchildren.fields)">
                <!-- 组件预览拆分 -->
                <component
                  :is="renderComponent"
                  :model="model"
                  :column="tabchildren.column"
                  :fields="tabchildren.fields"
                >
                  <!-- 插槽继承 -->
                  <template v-for="slot in getSlots(tab.fields)" :slot="slot">
                    <slot :name="slot"></slot>
                  </template>
                </component>
              </template>
            </kye-row>
          </kye-tab-pane>
        </kye-tabs>

        <!-- 判断是否有fields -->
        <template v-if="isArray(column.fields)">
          <component
            :is="renderComponent"
            :model="model"
            :column="column.column"
            :fields="column.fields"
          >
            <!-- 插槽继承 -->
            <template v-for="slot in getSlots(column.fields)" :slot="slot">
              <slot :name="slot"></slot>
            </template>
          </component>
        </template>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import FormFieldsRender from './form-fields-render'
  import ColumnTitle from './column-title'
  import FormFieldsDetail from './form-fields-detail'
  const isInt = number => /^[1-9]\d*$/.test(number)

  /**
   * 默认总列数
   * @type {Integer}
   */
  const DEFAULT_MAX_SPAN = 24

  export default {
    /**
     * 属性列表
     * @property {Object} model
     * @property {Array} layout - 布局数组
     * @property {Boolean} detail - 是否是详情布局
     */
    props: {
      model: {
        type: Object,
        required: true
      },
      layout: {
        type: Array,
        required: true
      },
      detail: Boolean
    },
    components: {
      ColumnTitle,
      FormFieldsRender,
      FormFieldsDetail
    },
    computed: {
      /**
       * 当前显示字段的组件
       */
      renderComponent () {
        return this.detail ? 'FormFieldsDetail' : 'FormFieldsRender'
      }
    },
    methods: {
      /**
       * 所占span处理
       * @param {Array} cols - 总列数信息
       * @param {Object} col - 当前列信息
       * @since 1.0.0
       */
      getSpan (cols, col) {
        if (Array.isArray(cols) && cols.length > 1) {
          return isInt(col.span) ? parseInt(col.span) : parseInt(DEFAULT_MAX_SPAN / cols.length)
        }
        return DEFAULT_MAX_SPAN
      },
      /**
       * 判断是否为一个数组
       * @param {Array} array - 需要验证的数据
       * @since 1.0.0
       */
      isArray (array) {
        return Array.isArray(array)
      },
      /**
       * 获取fields中所有的具名插槽
       * @param {Array} fields - 字段列表
       */
      getSlots (fields) {
        let slots = []
        Array.isArray(fields) && fields.forEach(field => {
          if (field.slot) {
            slots.push(field.slot)
          }
        })
        return slots
      }
    }
  }
</script>

<style lang="scss" scoped>
  .form-fields-row.el-row {
    margin: 0 !important;
  }
</style>
