/**
 * Created by cy on 2018-08-10.
 */

export default {
  functional: true,
  props: {
    index: Number,
    model: { type: Object, default: () => ({}) },
    render: { type: Function, required: true }
  },
  render(h, c) {
    return c.props.render(h, c)
  }
}
