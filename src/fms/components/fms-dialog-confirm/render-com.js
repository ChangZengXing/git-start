/**
 * Created by cy on 2018-08-07.
 */

export default {
  functional: true,
  props: {
    render: {
      type: Function,
      required: true
    }
  },
  render (h, c) {
    return c.props.render(h)
  }
}
