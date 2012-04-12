Background    = require('./inspector/background')
Border        = require('./inspector/border')
BorderRadius  = require('./inspector/border_radius')
Opacity       = require('./inspector/opacity')
BoxShadow     = require('./inspector/box_shadow')
TextShadow    = require('./inspector/text_shadow')
Dimensions    = require('./inspector/dimensions')
Utils         = require('lib/utils')

class Inspector extends Spine.Controller
  className: 'inspector'

  constructor: ->
    super

    @append(@dimensions   = new Dimensions(stage: @stage))
    @append(@background   = new Background(stage: @stage))
    @append(@border       = new Border(stage: @stage))
    @append(@borderRadius = new BorderRadius(stage: @stage))
    @append(@boxShadow    = new BoxShadow(stage: @stage))
    @append(@opacity      = new Opacity(stage: @stage))

    # We can increase performance dramatically by using
    # requestAnimationFrame and rendering async
    @stage.selection.bind 'change', => @dirty = true
    @frame()

  frame: =>
    @render() if @dirty
    Utils.requestAnimationFrame(@frame)

  render: =>
    # Do update in one paint
    @dirty = false
    @el.hide()

    @dimensions.render()
    @background.render()
    @border.render()
    @borderRadius.render()
    @boxShadow.render()
    @opacity.render()

    @el.show()
    this

  release: ->
    @stage.selection.unbind 'change', @render
    super

module.exports = Inspector