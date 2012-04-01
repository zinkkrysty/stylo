(function() {
  if (!this.require) {
    var modules = {}, cache = {};

    var require = function(name, root) {
      var path = expand(root, name), indexPath = expand(path, './index'), module, fn;
      module   = cache[path] || cache[indexPath];
      if (module) {
        return module;
      } else if (fn = modules[path] || modules[path = indexPath]) {
        module = {id: path, exports: {}};
        cache[path] = module.exports;
        fn(module.exports, function(name) {
          return require(name, dirname(path));
        }, module);
        return cache[path] = module.exports;
      } else {
        throw 'module ' + name + ' not found';
      }
    };

    var expand = function(root, name) {
      var results = [], parts, part;
      // If path is relative
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    };

    var dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };

    this.require = function(name) {
      return require(name, '');
    };

    this.require.define = function(bundle) {
      for (var key in bundle) {
        modules[key] = bundle[key];
      }
    };

    this.require.modules = modules;
    this.require.cache   = cache;
  }

  return this.require;
}).call(this);
this.require.define({"app/controllers/inspector/background":function(exports, require, module){(function() {
  var BI, Background, BackgroundImage, Collection, Color, ColorPicker, Edit, GradientPicker, List,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Collection = require('lib/collection');

  ColorPicker = require('lib/color_picker');

  GradientPicker = require('lib/gradient_picker');

  Color = require('app/models/properties/color');

  BackgroundImage = require('app/models/properties/background_image');

  BI = BackgroundImage;

  Edit = (function(_super) {

    __extends(Edit, _super);

    Edit.prototype.className = 'edit';

    Edit.prototype.events = {
      'change input': 'inputChange'
    };

    function Edit() {
      Edit.__super__.constructor.apply(this, arguments);
      this.change(this.background);
    }

    Edit.prototype.change = function(background) {
      this.background = background;
      return this.render();
    };

    Edit.prototype.render = function() {
      var picker,
        _this = this;
      this.el.empty();
      if (this.background instanceof BackgroundImage.Pure) {
        picker = new ColorPicker.Preview({
          color: this.background.color
        });
        picker.bind('change', function(color) {
          _this.background.color = color;
          return _this.trigger('change', _this.background);
        });
        return this.append(picker);
      } else if (this.background instanceof BackgroundImage.URL) {
        return this.html(JST['app/views/inspector/background/url'](this));
      } else if (this.background instanceof BackgroundImage.LinearGradient) {
        picker = new GradientPicker({
          gradient: this.background
        });
        picker.bind('change', function(background) {
          _this.background = background;
          return _this.trigger('change', _this.background);
        });
        return this.append(picker);
      } else {

      }
    };

    Edit.prototype.inputChange = function() {
      if (this.background instanceof BackgroundImage.URL) {
        this.background.url = this.$('input').val();
        return this.trigger('change', this.background);
      }
    };

    return Edit;

  })(Spine.Controller);

  List = (function(_super) {

    __extends(List, _super);

    List.prototype.className = 'list';

    List.prototype.events = {
      'click .item': 'click',
      'click button.plus': 'plus',
      'click button.minus': 'minus'
    };

    function List() {
      this.render = __bind(this.render, this);      List.__super__.constructor.apply(this, arguments);
      if (!this.backgrounds) throw 'backgrounds required';
      this.backgrounds.change(this.render);
      this.render();
    }

    List.prototype.render = function() {
      var selected;
      this.html(JST['app/views/inspector/background/list'](this));
      this.$('.item').removeClass('selected');
      selected = this.$('.item').get(this.backgrounds.indexOf(this.current));
      return $(selected).addClass('selected');
    };

    List.prototype.click = function(e) {
      this.current = this.backgrounds[$(e.currentTarget).index()];
      this.trigger('change', this.current);
      this.render();
      return false;
    };

    List.prototype.plus = function() {
      this.current = new BI.LinearGradient(new BI.Position(0), [new BI.ColorStop(new Color(255, 255, 255)), new BI.ColorStop(new Color(0, 0, 0))]);
      this.backgrounds.push(this.current);
      this.trigger('change', this.current);
      return false;
    };

    List.prototype.minus = function() {
      this.backgrounds.remove(this.current);
      this.current = this.backgrounds.first();
      this.trigger('change', this.current);
      return false;
    };

    return List;

  })(Spine.Controller);

  Background = (function(_super) {

    __extends(Background, _super);

    Background.prototype.className = 'background';

    function Background() {
      this.set = __bind(this.set, this);
      this.render = __bind(this.render, this);      Background.__super__.constructor.apply(this, arguments);
      this.render();
    }

    Background.prototype.render = function() {
      var _this = this;
      this.disabled = !this.stage.selection.isAny();
      this.backgrounds = this.stage.selection.get('backgroundImage');
      this.backgrounds = new Collection(this.backgrounds);
      this.current = this.backgrounds.first();
      this.backgrounds.change(this.set);
      this.el.empty();
      this.el.append('<h3>Background</h3>');
      this.list = new List({
        current: this.current,
        backgrounds: this.backgrounds
      });
      this.list.bind('change', function(current) {
        _this.current = current;
        return _this.edit.change(_this.current);
      });
      this.append(this.list);
      this.edit = new Edit({
        background: this.current
      });
      this.edit.bind('change', this.set);
      return this.append(this.edit);
    };

    Background.prototype.set = function() {
      return this.stage.selection.set('backgroundImage', this.backgrounds.valueOf());
    };

    return Background;

  })(Spine.Controller);

  module.exports = Background;

}).call(this);
;}});