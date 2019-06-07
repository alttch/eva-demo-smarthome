var eva_ui_config;
var eva_ui_config_class;
var eva_ui_config_buttons;
var eva_ui_config_data;
var eva_ui_config_control_blocks;
var eva_ui_config_data_blocks;
var eva_ui_config_cameras;
var eva_ui_config_charts;
var eva_ui_config_layout;
var eva_ui_config_layout_compact;
var eva_ui_config_url = document.location;
var eva_ui_main_page = '/ui/';

var eva_ui_login_window;
var eva_ui_content_holder;

var eva_ui_first_time_login = true;
var eva_ui_btn_coord;

var eva_ui_camera_reloader = Array();
var eva_ui_chart_creators = Array();

var eva_ui_is_compact = false;

var eva_ui_slider_update_funcs = Array();

var eva_ui_config_motd;

function eva_ui_format_camera_src(cam_id) {}

function eva_ui_after_draw() {}

function eva_ui_error(msg) {
  throw new Error(msg);
}

function eva_ui_server_error(code, msg, data) {
  eva_sfa_popup('eva_ui_popup', 'error', 'ERROR', msg, {ct: 2});
}

function eva_ui_server_is_gone(code, msg, data) {
  var ct = 10;
  var auto_reconnect = setTimeout(eva_sfa_start, (ct + 1) * 1000);
  eva_sfa_popup(
    'eva_ui_popup',
    'error',
    'Server error',
    'Connection to server failed',
    {
      ct: ct,
      btn1: 'Retry',
      btn1a: function() {
        clearTimeout(auto_reconnect);
        eva_sfa_start();
      }
    }
  );
}

function eva_ui_create_control_block(block_id) {
  if (
    !eva_ui_config_control_blocks ||
    !(block_id in eva_ui_config_control_blocks)
  ) {
    eva_ui_error('Control block ' + block_id + ' is not defined');
  }
  var cblk = $('<div />');
  cblk.addClass('eva_ui_control_block');
  $.each(eva_ui_config_control_blocks[block_id]['elements'], function(i, v) {
    cblk.append(eva_ui_create_button(v));
  });
  return cblk;
}

function eva_ui_append_action(el, config, is_btn, item) {
  var action = config.action;
  var a = null;
  if (!action) action = config.item;
  if (!action) return;
  if (config.menu) {
    if (is_btn) el.addClass('menu');
    if (config.menu === true || typeof config.menu == 'number') {
      var ms;
      config.menu === true ? (ms = 2) : (ms = config.menu);
      var mc = $('<span />');
      for (var i = 0; i < ms; i++) {
        var b = $('<button >');
        b.addClass('eva_ui_cbtn');
        b.addClass('i_' + config.icon);
        b.addClass('s_' + i);
        var params = $.extend({}, config.action_params);
        b.attr('eva-ui-status-to', i);
        b.on('click', function() {
          params['s'] = this.getAttribute('eva-ui-status-to');
          eva_sfa_action(
            action,
            params,
            function(result) {},
            function(code, msg, data) {
              if (is_btn) el.removeClass('busy');
              eva_ui_server_error(code, msg, data);
            }
          );
        });
        b.appendTo(mc);
      }
    } else {
      var mc = $('<span />');
      $.each(config.menu, function(i, v) {
        var b = eva_ui_create_button(v);
        b.appendTo(mc);
      });
    }
    el.popover({
      placement: 'bottom',
      html: true,
      trigger: 'click',
      content: mc
    });
    el.attr('data-toggle', 'popover');
    a = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('[data-toggle="popover"]').popover('hide');
      el.popover('show');
    };
  } else if (config.slider && is_btn) {
    el.addClass('menu');
    var min = config.slider.min;
    var max = config.slider.max;
    var step = config.slider.step;
    if (min === undefined || min === null) min = 0;
    if (max === undefined || max === null) max = 100;
    if (step == undefined || step === null) step = 1;
    var mc = $('<span />');
    var slc = $('<div />').addClass('eva_ui_slider_container');
    var slider = $('<input />', {
      id: 'eva_ui_slider_' + item,
      type: 'range',
      min: min - step,
      max: max
    }).addClass('eva_ui_slider');
    var slider_label = $('<div />', {
      id: 'eva_ui_slider_label_' + item
    }).addClass('eva_ui_slider_label');
    slider.on('input change', function() {
      var val = this.value;
      if (val < min) {
        val = 'OFF';
        slider.removeClass('slider_on');
        slider.addClass('slider_off');
      } else {
        slider.removeClass('slider_off');
        slider.addClass('slider_on');
      }
      slider_label.html(val + (config.value && val >= min ? config.value : ''));
    });
    slider.attr('step', step);
    slider.on('mouseup touchend', function() {
      $('[data-toggle="popover"]').popover('hide');
      var params = $.extend({}, config.action_params);
      var val = slider.val();
      if (action.startsWith('unit:')) {
        if (val < min) {
          params['s'] = 0;
        } else {
          params['s'] = 1;
          params['v'] = val;
        }
        eva_sfa_action(
          action,
          params,
          function() {},
          function(code, msg, data) {
            eva_ui_server_error(code, msg, data);
          }
        );
      } else if (action.startsWith('lvar:')) {
        var v;
        if (val < min) {
          v = null;
        } else {
          v = val;
        }
        if (is_btn) el.addClass('busy');
        eva_sfa_set(
          action,
          v,
          function() {
            if (is_btn) el.removeClass('busy');
          },
          function(code, msg, data) {
            if (is_btn) el.removeClass('busy');
            eva_ui_server_error(code, msg, data);
          }
        );
      } else if (action.startsWith('lmacro:')) {
        var params = $.extend({}, config.action_params);
        if (val < min) {
          params['a'] = 'OFF';
        } else {
          params['a'] = val;
        }
        if (is_btn) el.addClass('busy');
        if (!('w' in params)) {
          params['w'] = 60;
        }
        eva_sfa_run(
          action,
          params,
          function() {
            if (is_btn) el.removeClass('busy');
          },
          function(code, msg, data) {
            if (is_btn) el.removeClass('busy');
            eva_ui_server_error(code, msg, data);
          }
        );
      }
      console.log(params);
    });
    eva_ui_slider_update_funcs[item] = function(state) {
      if (state.status) {
        slider.val(state.value);
        slider_label.html(
          state.value + (config.value && state.value >= min ? config.value : '')
        );
        slider.removeClass('slider_off');
        slider.addClass('slider_on');
      } else {
        slider.val(min - step);
        slider_label.html('OFF');
        slider.removeClass('slider_on');
        slider.addClass('slider_off');
      }
    };
    slc.append(slider);
    slc.append(slider_label);
    mc.append(slc);
    el.popover({
      placement: 'bottom',
      html: true,
      trigger: 'click',
      content: mc
    });
    el.attr('data-toggle', 'popover');
    a = function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('[data-toggle="popover"]').popover('hide');
      el.popover('show');
    };
  } else if (action.startsWith('unit:')) {
    if (config.action_params && 's' in config.action_params) {
      a = function() {
        eva_sfa_action(
          action,
          config.action_params,
          function() {},
          function(code, msg, data) {
            eva_ui_server_error(code, msg, data);
          }
        );
      };
    } else {
      a = function() {
        eva_sfa_action_toggle(
          action,
          config.action_params,
          function(result) {},
          function(code, msg, data) {
            eva_ui_server_error(code, msg, data);
          }
        );
      };
    }
  } else if (action.startsWith('lvar:')) {
    if (config.action_params && 'v' in config.action_params) {
      a = function() {
        if (is_btn) el.addClass('busy');
        eva_sfa_set(
          action,
          config.action_params,
          function() {
            if (is_btn) el.removeClass('busy');
          },
          function(code, msg, data) {
            if (is_btn) el.removeClass('busy');
            eva_ui_server_error(code, msg, data);
          }
        );
      };
    } else {
      a = function() {
        if (is_btn) el.addClass('busy');
        eva_sfa_toggle(
          action,
          function() {
            if (is_btn) el.removeClass('busy');
          },
          function(code, msg, data) {
            if (is_btn) el.removeClass('busy');
            eva_ui_server_error(code, msg, data);
          }
        );
      };
    }
  } else if (action.startsWith('lmacro:')) {
    if (is_btn) el.addClass('gear');
    a = function() {
      if (is_btn) el.addClass('busy');
      var params = $.extend({}, config.action_params);
      if (!('w' in params)) {
        params['w'] = 60;
      }
      eva_sfa_run(
        action,
        params,
        function() {
          if (is_btn) el.removeClass('busy');
        },
        function(code, msg, data) {
          if (is_btn) el.removeClass('busy');
          eva_ui_server_error(code, msg, data);
        }
      );
    };
  } else if (action.startsWith('url:')) {
    a = function() {
      document.location = action.substring(4);
    };
  } else if (action.startsWith('javascript:')) {
    a = function() {
      eval(action);
    };
  }
  if (a) {
    el.on('click', a);
    if (!is_btn) {
      el.css('cursor', 'pointer');
    }
  }
}

function eva_ui_create_button(btn_name) {
  if (!eva_ui_config_buttons || !(btn_name in eva_ui_config_buttons)) {
    eva_ui_error('Button ' + btn_name + ' is not defined');
  }
  var btn_config = eva_ui_config_buttons[btn_name];
  var button = $('<button />', {id: 'eva_ui_cbtn_' + btn_name});
  button.addClass('eva_ui_cbtn');
  $.each(btn_config.icon.split('.'), function(i, v) {
    button.addClass((i == 0 ? 'i_' : '') + v);
  });
  if (btn_config.title) {
    $('<span />')
      .addClass('title')
      .html(btn_config.title)
      .appendTo(button);
  }
  var button_value = null;
  if (btn_config.value !== false) {
    button_value = $('<span />');
    var bv = $('<span />').addClass('value');
    bv.append(button_value);
    var button_value_units = $('<span />');
    bv.append(button_value_units);
    button.append(bv);
    var value_always = btn_config.value_always;
    var value_units = btn_config.value;
  }
  var item = btn_config.item;
  var istatus = btn_config.status;
  if (!istatus) istatus = item;
  eva_ui_append_action(button, btn_config, true, istatus);
  if (istatus) {
    if (istatus.startsWith('unit:')) {
      button.addClass('s_');
      eva_sfa_register_update_state(istatus, function(state) {
        if (istatus in eva_ui_slider_update_funcs) {
          eva_ui_slider_update_funcs[istatus](state);
        }
        button.attr(
          'class',
          button.attr('class').replace(/\bs_\d*/g, 's_' + state.status)
        );
        if (button_value) {
          if (state.status || value_always) {
            button_value.html(state.value);
            button_value_units.html(value_units);
          } else {
            button_value.html('');
            button_value_units.html('');
          }
        }
        if (state.status != state.nstatus || state.value != state.nvalue) {
          button.addClass('busy');
        } else {
          button.removeClass('busy');
        }
      });
    } else if (istatus.startsWith('lvar:')) {
      if (istatus in eva_ui_slider_update_funcs) {
        eva_ui_slider_update_funcs[istatus](state);
      }
      button.addClass('s_');
      eva_sfa_register_update_state(istatus, function(state) {
        button.attr(
          'class',
          button.attr('class').replace(/\bs_.*/g, 's_' + state.value)
        );
      });
    }
  }
  return button;
}

function eva_ui_create_data_item(data_item_id) {
  if (!eva_ui_config_data || !(data_item_id in eva_ui_config_data)) {
    eva_ui_error('data item ' + data_item_id + ' is not defined');
  }
  var data_item_config = eva_ui_config_data[data_item_id];
  var data_item = $('<div />');
  var data_item_value = $('<span />', {
    id: 'eva_ui_data_value_' + data_item_id
  });
  data_item.append(data_item_value);
  $('<span />')
    .html(data_item_config['u'])
    .appendTo(data_item);
  data_item.attr('eva-display-decimals', data_item_config['decimals']);
  data_item.addClass('eva_ui_data_item');
  data_item.addClass('i_' + data_item_config.icon);
  eva_ui_append_action(data_item, data_item_config, false);
  var item = data_item_config['item'];
  eva_sfa_register_update_state(item, function(state) {
    var v = state.value;
    var dc = data_item.attr('eva-display-decimals');
    if (dc !== undefined && dc !== null && !isNaN(v)) {
      try {
        v = parseFloat(v).toFixed(dc);
      } catch (e) {}
    }
    data_item_value.html(v);
  });
  return data_item;
}

function eva_ui_recreate_objects() {
  $.each(eva_ui_chart_creators, function(i, v) {
    v();
  });
}

function eva_ui_init() {
  if ('url' in eva_ui_config) {
    eva_ui_config_url = eva_ui_config['url'];
  }
  if ('class' in eva_ui_config) {
    eva_ui_config_class = eva_ui_config['class'];
  }
  if ('motd' in eva_ui_config) {
    eva_ui_config_motd = eva_ui_config['motd'];
  }
  if ('default-login' in eva_ui_config) {
    eva_sfa_login = eva_ui_config['default-login'];
  }
  if ('layout' in eva_ui_config) {
    eva_ui_config_layout = eva_ui_config['layout'];
  }
  if ('layout-compact' in eva_ui_config) {
    eva_ui_config_layout_compact = eva_ui_config['layout-compact'];
  }
  $('body').empty();
  $('body').on('click', function(e) {
    if (
      $(e.target).data('toggle') !== 'popover' &&
      $(e.target).parents('.popover.in').length === 0
    ) {
      $('[data-toggle="popover"]').popover('hide');
    }
    if (
      $(e.target).data('toggle') !== 'menu' &&
      $(e.target).data('toggle') != 'menuicon' &&
      $(e.target).parents().data('toggle') != 'menuicon'
    ) {
      $('[data-toggle="menu"]').hide();
    }
  });
  $('<div />', {id: 'eva_ui_popup'}).appendTo('body');
  $('<div />', {id: 'eva_ui_anim'}).appendTo('body');
  if (eva_ui_config_class == 'dashboard') {
    if ('buttons' in eva_ui_config) {
      eva_ui_config_buttons = eva_ui_config['buttons'];
    }
    if ('data' in eva_ui_config) {
      eva_ui_config_data = eva_ui_config['data'];
    }
    if ('data-blocks' in eva_ui_config) {
      eva_ui_config_data_blocks = eva_ui_config['data-blocks'];
    }
    if ('control-blocks' in eva_ui_config) {
      eva_ui_config_control_blocks = eva_ui_config['control-blocks'];
    }
    if ('cameras' in eva_ui_config) {
      eva_ui_config_cameras = eva_ui_config['cameras'];
    }
    eva_ui_login_window = $('<div >/', {id: 'eva_ui_login_window'}).addClass(
      'eva_ui_dialog_window_holder'
    );
    eva_ui_login_window.hide();
    eva_ui_login_window.html(
      '<div class="eva_ui_dialog_window"> \
        <form id="eva_ui_login_form" \
            onsubmit="javascript:eva_ui_submit_login();return false;"> \
          <div class="form-group eva_ui_input_form"> \
            <div class="eva_ui_error_message" id="eva_ui_login_error"></div> \
            <input type="text" class="form-control" name="login" \
                id="eva_ui_login" value="" placeholder="User"/> \
            <input type="password" class="form-control" \
                name="password" id="eva_ui_password" \
                value="" placeholder="Password"/> \
          </div> \
          <div class="form-group eva_ui_custom_checkbox"> \
            <input type="checkbox" id="eva_ui_remember_auth"/> \
            <label for="eva_ui_remember_auth">Remember me</label> \
          </div> \
          <div class="form-group"> \
            <input type="submit" class="btn" value="Log in"/> \
          </div> \
        </form> \
      </div>'
    );
    eva_ui_login_window.appendTo('body');
    if (eva_ui_config_motd) {
      var motd = $('<div />')
        .addClass('eva_ui_motd')
        .html(eva_ui_config_motd);
      $('#eva_ui_login_form').append(motd);
    }
    var bg = $('<div />').addClass('eva_ui_bg');
    var main = $('<div />', {id: 'eva_ui_main'});
    var container = $('<div />').addClass('container');
    var row = $('<div />').addClass('row');
    bg.appendTo('body');
    main.appendTo(bg);
    container.appendTo(main);
    row.appendTo(container);
    eva_ui_content_holder = $('<div />').addClass('eva_ui_content_holder');
    eva_ui_content_holder.hide();
    eva_ui_content_holder.appendTo(row);
    eva_sfa_cb_login_success = function() {
      eva_ui_login_window.hide();
      eva_ui_update_sysblock();
    };
    eva_sfa_heartbeat_error = function() {
      eva_sfa_stop();
      eva_ui_server_is_gone();
    };
    eva_sfa_cb_login_error = function(code, msg, data) {
      eva_ui_stop_cams();
      if (code == 2) {
        eva_ui_stop_animation();
        eva_ui_erase_login_cookies();
        eva_ui_content_holder.hide();
        eva_ui_login_window.show();
        if (eva_ui_first_time_login) {
          eva_ui_first_time_login = false;
        } else {
          $('#eva_ui_login_error').html(msg);
          $('#eva_ui_login_error').show();
        }
        $('#eva_ui_login').val(eva_sfa_login);
        $('#eva_ui_password').val('');
        eva_ui_focus_login_form();
      } else {
        eva_ui_server_is_gone(code, msg, data);
      }
    };
  } else if (eva_ui_config_class == 'sensors') {
    if ('main-page' in eva_ui_config) {
      eva_ui_main_page = eva_ui_config['main-page'];
    }
    if ('charts' in eva_ui_config) {
      eva_ui_config_charts = eva_ui_config['charts'];
    }
    eva_sfa_cb_login_success = function() {
      eva_ui_update_sysblock();
    };
    eva_sfa_cb_login_error = function(code, msg, data) {
      document.location = eva_ui_main_page;
    };
    var bg = $('<div />')
      .addClass('eva_ui_bg')
      .addClass('bg_sensors');
    eva_ui_content_holder = $('<div />').addClass(
      'eva_ui_content_holder_sensors'
    );
    eva_ui_content_holder.hide();
    eva_ui_content_holder.appendTo(bg);
    bg.append(
      $('<div />')
        .addClass('eva_ui_sysblock')
        .html(eva_ui_create_sysblock())
    );
    bg.appendTo('body');
  }
  eva_sfa_cb_states_loaded = function() {
    eva_ui_redraw_layout();
    eva_ui_stop_animation();
    eva_ui_content_holder.show();
    eva_ui_recreate_objects();
  };
  var reload_ui = function() {
    document.location = document.location;
  };
  eva_sfa_reload_handler = function() {
    var ct = 5;
    eva_sfa_popup(
      'eva_ui_popup',
      'warning',
      'UI reload',
      'Server asked clients to reload UI',
      {
        ct: ct,
        btn1: 'Reload',
        btn1a: reload_ui
      }
    );
    setTimeout(reload_ui, ct * 1000);
  };
  eva_sfa_server_restart_handler = function() {
    var ct = 15;
    eva_sfa_popup(
      'eva_ui_popup',
      'warning',
      'Server restart',
      'Server is being restarted, UI will \
            be reconnected in ' +
        ct +
        ' seconds. All functions are stopped',
      {
        ct: ct
      }
    );
    eva_ui_stop_cams();
    eva_sfa_stop();
    setTimeout(eva_sfa_start, ct * 1000);
  };
}

function eva_ui_focus_login_form() {
  if (eva_sfa_login) {
    $('#eva_ui_login').val(eva_sfa_login);
    $('#eva_ui_password').focus();
  } else {
    $('#eva_ui_login').focus();
  }
}

function eva_ui_update_sysblock() {
  if (eva_sfa_server_info) {
    $('.eva_version').html(eva_sfa_server_info.version);
    $('.eva_build').html(eva_sfa_server_info.product_build);
    $('.eva_key_id').html(eva_sfa_server_info.acl.key_id);
  }
}

function eva_ui_stop_cams() {
  while (eva_ui_camera_reloader.length > 0) {
    var reloader = eva_ui_camera_reloader.pop();
    clearInterval(reloader);
  }
}

function eva_ui_top_bar() {
  if (!navigator.userAgent.startsWith('evaHI ')) eva_ui_init_top_bar();
}

function eva_ui_init_top_bar() {
  var topbar = $('<div />', {id: 'eva_ui_top_bar'});
  var menuicon = $('<div />', {'data-toggle': 'menuicon'})
    .css('cursor', 'pointer')
    .css('width', '30px')
    .css('margin-top', '5px');
  for (var i = 0; i < 3; i++) {
    $('<div />')
      .css('width', '24px')
      .css('height', '3px')
      .css('background-color', '#555')
      .css('margin', '4px')
      .appendTo(menuicon);
  }
  menuicon.on('click', eva_ui_show_menu);
  topbar.append(menuicon);
  var html =
    'EVA ICS v<span class="eva_version"></span>, \
    build <span class="eva_build"></span>, \
    key id: <span class="eva_key_id"></span>';
  $('<div />')
    .addClass('eva_ui_top_bar_sysblock')
    .html(html)
    .appendTo(topbar);
  eva_ui_content_holder.addClass('with_topbar');
  eva_ui_content_holder.append(topbar);
  var menu = $('<div />', {id: 'eva_ui_menu', 'data-toggle': 'menu'});
  eva_ui_content_holder.append(menu);
}

function eva_ui_show_menu() {
  $('#eva_ui_menu').show();
}

function eva_ui_redraw_layout() {
  eva_ui_content_holder.empty();
  eva_ui_top_bar();
  eva_ui_stop_cams();
  eva_ui_chart_creators = Array();
  if ($(window).width() < 768) {
    eva_ui_draw_compact_layout();
    eva_ui_is_compact = true;
  } else {
    eva_ui_draw_layout();
    eva_ui_is_compact = false;
  }
  eva_ui_update_sysblock();
  eva_ui_after_draw();
}

function eva_ui_create_data_block(block_id) {
  var dh = $('<div />').addClass('eva_ui_data_holder');
  if (
    !eva_ui_config_data_blocks ||
    (!(block_id in eva_ui_config_data_blocks) ||
      !('elements' in eva_ui_config_data_blocks[block_id]))
  ) {
    eva_ui_error(
      'data block ' + block_id + ' is not defined or contains no elements'
    );
  }
  $.each(eva_ui_config_data_blocks[block_id]['elements'], function(i, v) {
    dh.append(eva_ui_create_data_item(v));
  });
  eva_ui_append_action(dh, eva_ui_config_data_blocks[block_id], false);
  return dh;
}

function eva_ui_create_cam(cam_cfg) {
  if (!cam_cfg || !('id' in cam_cfg)) {
    eva_ui_error('Invalid camera block');
  }
  if (!eva_ui_config_cameras || !(cam_cfg['id'] in eva_ui_config_cameras)) {
    eva_ui_error('Camera ' + cam_cfg['id'] + ' is not defined');
  }
  console.log(cam_cfg);
  var cam_id = cam_cfg['id'];
  var reload_int = cam_cfg['reload'];
  if (!reload_int) reload_int = 1;
  var cam = $('<div />').addClass('eva_ui_camera_block');
  var cam_img = $('<img />').attr('id', 'eva_ui_camera_' + cam_id);
  cam_img.appendTo(cam);
  var reloader = setInterval(
    'eva_ui_reload_camera("' + cam_id + '")',
    reload_int * 1000
  );
  eva_ui_camera_reloader.push(reloader);
  eva_ui_append_action(cam, cam_cfg, false);
  return cam;
}

function eva_ui_create_chart_config(config) {
  var c_type = config['type'] ? config['type'] : 'line';
  var c_label = config['label'] ? config['label'] : '';
  var c_fill = config['fill'] ? config['fill'] : 'start';
  var c_color = config['color'] ? config['color'] : '#aaaaaa';
  var c_background = config['background-color']
    ? config['background-color']
    : '#eeeeee';
  if (!config['cfg'] || config['cfg'] == 'default') {
    return {
      type: c_type,
      data: {
        labels: [],
        datasets: [
          {
            label: c_label,
            data: [],
            fill: c_fill,
            pointRadius: 0,
            borderColor: c_color,
            backgroundColor: c_background
          }
        ]
      },
      options: eva_ui_chart_options
    };
  }
}

function eva_ui_create_chart(chart_id, reload) {
  var reload_int = reload;
  var chart_config = eva_ui_config_charts[chart_id];
  if (!reload_int) reload_int = 60;
  var chart = $('<div />').addClass('eva_ui_chart_item');
  var chart_info = $('<div />')
    .addClass('eva_ui_chart_value')
    .addClass('eva_ui_data_item')
    .addClass('c_' + chart_config['icon']);
  var chart_item_state = $('<span />', {
    id: 'eva_ui_chart_' + chart_id + '_state'
  }).appendTo(chart_info);
  chart_item_state.attr('eva-display-decimals', chart_config['decimals']);
  $('<span />')
    .html(chart_config['u'])
    .appendTo(chart_info);
  chart.append(chart_info);
  if ('params' in chart_config && chart_config['params']['prop'] == 'status') {
    eva_sfa_register_update_state(chart_config['item'], function(state) {
      chart_item_state.html(state.status);
    });
  } else {
    eva_sfa_register_update_state(chart_config['item'], function(state) {
      var v = state.value;
      var dc = chart_item_state.attr('eva-display-decimals');
      if (dc !== undefined && dc !== null && !isNaN(v)) {
        try {
          v = parseFloat(v).toFixed(dc);
        } catch (e) {}
      }
      chart_item_state.html(v);
    });
  }
  $('<div />')
    .addClass('eva_ui_chart_value_units')
    .html(chart_config['u'])
    .appendTo(chart);
  $('<div />', {id: 'eva_ui_chart_content_' + chart_id})
    .addClass('eva_ui_chart')
    .appendTo(chart);
  var params = $.extend({}, chart_config.params);
  params['update'] = reload_int;
  params['u'] = chart_config['u'];
  var ccfg = eva_ui_create_chart_config(chart_config);
  var creator = function() {
    eva_sfa_chart(
      'eva_ui_chart_content_' + chart_id,
      ccfg,
      chart_config['item'],
      params
    );
  };
  eva_ui_chart_creators.push(creator);
  return chart;
}

function eva_ui_draw_layout() {
  var cams = Array();
  if (eva_ui_config_class == 'dashboard') {
    for (i = 1; i < 4; i++) {
      if ('bar' + i in eva_ui_config_layout) {
        var bar = $('<div />').addClass('eva_ui_bar');
        var bar_cfg = eva_ui_config_layout['bar' + i];
        if ('camera' in bar_cfg) {
          var cam = eva_ui_create_cam(bar_cfg['camera']);
          bar.append(cam);
          cams.push(bar_cfg['camera']['id']);
        }
        var fcb = true;
        if ('control-blocks' in bar_cfg) {
          $.each(bar_cfg['control-blocks'], function(i, v) {
            var cb = eva_ui_create_control_block(v);
            if (!('camera' in bar_cfg)) {
              cb.css('border-top', '0px');
            }
            bar.append(cb);
            fcb = false;
          });
        }
        var dblk = null;
        if (bar_cfg['data-block']) {
          if (!dblk) dblk = $('<div />').addClass('eva_ui_data_block');
          dblk.append(eva_ui_create_data_block(bar_cfg['data-block']));
        }
        if (bar_cfg['sys-block']) {
          if (!dblk) dblk = $('<div />').addClass('eva_ui_data_block');
          $('<div />')
            .addClass('eva_ui_sysblock')
            .html(eva_ui_create_sysblock())
            .appendTo(dblk);
        }
        if (dblk) bar.append(dblk);
        eva_ui_content_holder.append(bar);
      }
    }
  } else if (eva_ui_config_class == 'sensors') {
    $('<a />')
      .attr('href', eva_ui_main_page)
      .addClass('eva_ui_close_btn')
      .addClass('secondary_page')
      .appendTo(eva_ui_content_holder);
    $.each(eva_ui_config_layout['charts'], function(i, v) {
      var chart = eva_ui_create_chart(v['id'], v['reload']);
      eva_ui_content_holder.append(chart);
    });
  }
  $.each(cams, function(i, v) {
    eva_ui_reload_camera(v);
  });
}

function eva_ui_create_sysblock(mini) {
  var html =
    'EVA ICS v<span class="eva_version"></span>, \
    build <span class="eva_build"></span>, \
    key id: <span class="eva_key_id"></span>';
  if (!mini) {
    html = html + '<br />';
    if (!navigator.userAgent.startsWith('evaHI ')) {
      html =
        html +
        '<div class="eva_ui_dialog_window_holder evacc_setup" \
            onclick="eva_ui_close_cc_setup(event)"> \
          <div class="eva_ui_dialog_window"> \
            <div class="eva_ui_setup_form"> \
              <div class="eva_ui_close_btn" \
                onclick="eva_ui_close_cc_setup()"></div> \
              <a href="https://play.google.com/store/apps/details?id=com.altertech.evacc" \
              class="eva_ui_andr_app"></a> \
              <span>Scan this code with </span> \
              <a href="https://play.google.com/store/apps/details?id=com.altertech.evacc" \
                class="eva_ui_app_link">EVA Control Center app</a> \
              <div class="eva_ui_qr_install"><canvas id="evaccqr"></canvas></div> \
            </div> \
          </div> \
        </div> \
        <span class="eva_ui_links" style="margin-right: 10px" \
          onclick="eva_ui_open_cc_setup(event);">EvaCC setup</span>';
    }
    html +=
      '<span class="eva_ui_links" onclick="eva_ui_logout()">Logout</span>';
  }
  return html;
}

function eva_ui_draw_compact_layout() {
  if (!eva_ui_config_layout_compact) return eva_ui_draw_layout();
  var cams = Array();
  if (eva_ui_config_class == 'dashboard') {
    var row = $('<div />');
    var fcb = true;
    $.each(eva_ui_config_layout_compact['elements'], function(i, v) {
      if (v['type'] == 'control-block') {
        var cb = eva_ui_create_control_block(v['id']);
        if (fcb) {
          cb.css('border-top', '0px');
          fcb = false;
        }
        row.append(cb);
      } else {
        fcb = true;
        if (v['type'] == 'data-block') {
          row.append(eva_ui_create_data_block(v['id']));
        } else if (v['type'] == 'sys-block') {
          $('<div />')
            .addClass('eva_ui_sysblock')
            .html(eva_ui_create_sysblock())
            .appendTo(row);
        } else if (v['type'] == 'spacer') {
          var h = v['height'];
          if (!h) h = '12px';
          $('<div />')
            .css('height', h)
            .appendTo(row);
        } else if (v['type'] == 'camera') {
          var reload_int = v['reload'];
          if (!reload_int) reload_int = 1;
          var cam = eva_ui_create_cam(v);
          row.append(cam);
          cams.push(v['id']);
        }
      }
      eva_ui_content_holder.append(row);
    });
  } else if (eva_ui_config_class == 'sensors') {
    return eva_ui_draw_layout();
  }
  $.each(cams, function(i, v) {
    eva_ui_reload_camera(v);
  });
}

function eva_ui_submit_login() {
  eva_sfa_login = $('#eva_ui_login').val();
  eva_sfa_password = $('#eva_ui_password').val();
  if ($('#eva_ui_remember_auth').prop('checked')) {
    eva_sfa_create_cookie('eva_ui_login', eva_sfa_login, 365);
    eva_sfa_create_cookie('eva_ui_password', eva_sfa_password, 365);
  }
  eva_ui_start_animation();
  eva_sfa_start();
}

function eva_ui_start() {
  var oldSize = $(window).width();
  window.addEventListener('resize', function() {
    var w = $(window).width();
    if ((w > 767 && eva_ui_is_compact) || (w < 768 && !eva_ui_is_compact)) {
      eva_ui_redraw_layout();
      eva_ui_recreate_objects();
    }
  });
  var l = eva_sfa_read_cookie('eva_ui_login');
  var p = eva_sfa_read_cookie('eva_ui_password');
  if (l && p) {
    eva_sfa_login = l;
    eva_sfa_password = p;
  }
  eva_ui_start_animation();
  eva_sfa_start();
}

function eva_ui_start_animation() {
  $('.eva_ui_bg').hide();
  eva_sfa_load_animation('eva_ui_anim');
  $('#eva_ui_anim')
    .show()
    .css('display', 'flex');
}

function eva_ui_stop_animation() {
  $('#eva_ui_anim').hide();
  $('#eva_ui_anim').empty();
  $('.eva_ui_bg').show();
}

function eva_ui_open_cc_setup(e) {
  if (!eva_ui_btn_coord) {
    window.addEventListener('resize', function() {
      var target = $('#eva_ui_ccsetup_btn')[0];
      eva_ui_btn_coord = {
        x: target.offsetLeft - $(window).scrollLeft() + 30,
        y: target.offsetTop - $(window).scrollTop() + 5
      };
      $('#evscc_setup_btn');
    });
  }
  $('body').css({overflow: 'hidden'});
  eva_ui_btn_coord = {
    x: e.target.offsetLeft - $(window).scrollLeft() + 30,
    y: e.target.offsetTop - $(window).scrollTop() + 5
  };
  eva_sfa_hi_qr('evaccqr', {url: eva_ui_config_url, password: null});
  $('.eva_ui_setup_form').css({
    top: eva_ui_btn_coord.y,
    left: eva_ui_btn_coord.x
  });
  $('.evacc_setup').fadeIn();
  $('.eva_ui_setup_form').css({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(1)'
  });
}

function eva_ui_close_cc_setup(e) {
  if (e) {
    if (
      e.target != $('.setup_form')[0] &&
      $(e.target).closest('.setup_form').length === 0
    ) {
      $('.eva_ui_setup_form').css({
        top: eva_ui_btn_coord.y,
        left: eva_ui_btn_coord.x,
        transform: 'translate(-50%, -50%) scale(0)'
      });
      $('.evacc_setup').fadeOut();
      $('body').css({overflow: 'auto'});
    }
  } else {
    $('.eva_ui_setup_form').css({
      top: eva_ui_btn_coord.y,
      left: eva_ui_btn_coord.x,
      transform: 'translate(-50%, -50%) scale(0)'
    });
    $('.evacc_setup').fadeOut();
    $('body').css({overflow: 'auto'});
  }
}

function eva_ui_reload_camera(cam_id) {
  var src = eva_ui_format_camera_src(cam_id);
  if (!src) {
    src = eva_ui_config_cameras[cam_id]['image'].replace(
      '$NOCACHE',
      Date.now()
    );
  }
  $('#eva_ui_camera_' + cam_id).attr('src', src);
}

function eva_ui_erase_login_cookies() {
  eva_sfa_erase_cookie('eva_ui_login');
  eva_sfa_erase_cookie('eva_ui_password');
}

function eva_ui_logout() {
  eva_sfa_stop();
  eva_ui_erase_login_cookies();
  document.location = document.location;
}