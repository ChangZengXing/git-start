<template>
  <div class="page"
       ref="pageRef">
    <div class="box">
      <canvas id="organization"
              class="canvansBox"
              ref="canvasRef">
      </canvas>
    </div>
  </div>
</template>

<script>
  // import { fabric } from 'fabric'
  import KYMindMap from '@/shared/components/kye-draw/KYMindMap.js'
  import { Config } from '@/flow/helpers/ky-canvas-api/AuditConfig.js'
  export default {
    props: {
      dialogData: { type: Object }
    },
    data () {
      return {
        kyMind: null
      }
    },
    // watch: {
    //   dialogData (val) {
    //     console.log(val)
    //     this.initFlow()
    //   }
    // },
    mounted () {
      this.init()
      this.initFlow()
      console.log(this.dialogData)
    },
    methods: {
      init () {
        if (this.kyMind) {
          this.kyMind.clearCanvas()
        }
        const that = this
        if (!this.kyMind) {
          Config.controlState.startZoom = Config.controlState.maxZoom = Config.controlState.minZoom = 1
          Config.controlState.startZoom = Config.controlState.maxZoom = Config.controlState.minZoom /= window.devicePixelRatio
          Config.drawStartPosition.y = (that.$refs.pageRef.clientHeight / window.devicePixelRatio) - that.$refs.pageRef.clientHeight / 2
          Config.drawStartPosition.x = (that.$refs.pageRef.clientWidth / window.devicePixelRatio) - that.$refs.pageRef.clientWidth + 260 / window.devicePixelRatio
          this.kyMind = new KYMindMap('organization', Config, {
            width: that.$refs.pageRef.clientWidth,
            height: that.$refs.pageRef.clientHeight,
          })
        }
        // this.resize()
        // window.addEventListener('resize', this.resize)
      },
      initFlow () {
        this.kyMind.clearCanvas()
        // this.loading = false
        console.log(this.dialogData)
        this.kyMind.fromJSON(this.dialogData, 'Traverse')
        Config.refreshObject(this.kyMind)
      }
    }
  }
</script>

<style scoped>
  .page {
    height: 600px;
  }
</style>
