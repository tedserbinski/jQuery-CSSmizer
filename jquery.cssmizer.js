(function($) {
  var currentTheme, currentCSS, currentCSSObj, themes, fonts, colors;

  /**
   * Initialize CSSmizer
   */
  $.fn.cssmizer = function(settings) {
    return this.each(function() {
      currentTheme = settings.defaultTheme;
      currentCSS =  settings.defaultCSS || $.generateCSS(settings.themes[currentTheme].css);
      currentCSSObj = $.parseCSS(currentCSS);
      themes = settings.themes;
      fonts = settings.fonts;
      colors = settings.colors;

      $.applyCSS(currentCSSObj);
      $.buildThemes();
      $.buildColors();
      $.buildFonts();
      $.buildCSS();
    });
  };


  /**
   * Return currently selected theme
   */
  $.getCurrentTheme = function() {
    return currentTheme;
  };


  /**
   * Return currently selected theme
   */
  $.getCurrentCSS = function() {
    return currentCSS;
  };


  /**
   * Setup the themes tab
   */
  $.buildThemes = function() {
    // only execute if this div is found
    // if it isn't, then this functionality isn't needed
    if ($("#cssmizer-themes").length > 0) {
      var t = '';
      for (theme in themes) {
        t += '<dl id="'+ theme +'" class="icon"><dt><img src="'+ themes[theme].icon +'" alt="'+ themes[theme].name +'" title="'+ themes[theme].name +'" /></dt><dd>'+ themes[theme].name +'</dd></dl>';
      }
      if (currentTheme == 'custom') {
        t += '<dl id="custom" class="icon"><dt><img src="images/layout-custom.gif" alt="Custom theme" title="Custom theme" /></dt><dd>Custom</dd></dl>';
      }
      $("#cssmizer-themes").html(t);
      $("#"+ currentTheme).addClass("selected");

      $("#cssmizer-themes>dl").click(function() {
        var check = true;
        if (currentTheme == 'custom') {
          check = confirm("If you change themes, any previous customizations will be lost. Do you want to continue?");
        }

        if (check) {
          $("#custom").fadeOut('slow', function() { $(this).remove(); });
          $("#"+ currentTheme).removeClass("selected");
          currentTheme = this.id;
          $("#"+ currentTheme).addClass("selected");
          currentCSSObj = themes[currentTheme].css;
          currentCSS = $.generateCSS(currentCSSObj);

          $.applyCSS(currentCSSObj);
          $.buildColors();
          $.buildFonts();
          $.buildCSS();
        }
      });
    }
  }


  /**
   * Build the colors tab
   *
   * Note: any property that wants to enable the color selector needs to have "color" in it
   *       e.g., instead of background: #000; use background-color: #000
   */
  $.buildColors = function() {
    // only execute if this div is found
    // if it isn't, then this functionality isn't needed
    if ($("#cssmizer-colors").length > 0) {
      if (currentTheme == 'custom') {
        $("#cssmizer-colors").html('<p id="warning">This feature does not work with themes that have manually editted CSS.</p>');
      }
      else {
        $("#cssmizer-colors").html('<div id="colors"></div><div id="colorpicker"></div>');
        $("#colors").html('');
        var farb = $.farbtastic('#colorpicker');

        for (id in colors[currentTheme]) {
          $('#colors').append(
            '<div class="form-item"><label for="'+ id +'">'+ colors[currentTheme][id].label +'</label>'+
            '<input id="'+ id +'" value="'+ themes[currentTheme].css[colors[currentTheme][id].selector][colors[currentTheme][id].property] +'" type="text" size="8" maxlength="7" />'+
            '</div>'
          );

          // link to color picker temporarily to initialize
          farb.linkTo(function () {}).setColor('#000').linkTo($('#'+ id));

          $('#'+ id)
            .focus(function() {
              var input = this;

              farb.linkTo(function (color) {
                // set background/foreground color
                $(input).css({
                  backgroundColor: color,
                  color: farb.RGBToHSL(farb.unpack(color))[2] > 0.5 ? '#000' : '#fff'
                });

                // change input value
                if (input.value && input.value != color) {
                  var id = input.id;
                  var selector = colors[currentTheme][id].selector;
                  var property = colors[currentTheme][id].property;

                  input.value = color; 
                  currentCSSObj[selector][property] = color;
                  currentCSS = $.generateCSS(currentCSSObj);
                  // this is much faster than using applyCSS() since we are only applying one attribute
                  $(selector).css(property, color);
                  $.buildCSS();
                }
              });
              farb.setColor(this.value);
              $(input).keyup(farb.updateValue).parent().addClass('item-selected');
            })
            .blur(function() {
              $(this).parent().removeClass('item-selected');
            });
        }
      }
    }
  };


  /**
   * Built the fonts tab
   */
  $.buildFonts = function() {
    // only execute if this div is found
    // if it isn't, then this functionality isn't needed
    if ($("#cssmizer-fonts").length > 0) {
      $("#cssmizer-fonts").html('');

      if (currentTheme == 'custom') {
        $("#cssmizer-fonts").html('<p id="warning">This feature does not work with themes that have manually editted CSS.</p>');
      }
      else {
        var fontFamilyValues = '<option value="Arial" class="font-arial">Arial</option>'+
                               '<option value="Comic Sans" class="font-comic">Comic Sans</option>'+
                               '<option value="Courier New" class="font-courier">Courier New</option>'+
                               '<option value="Georgia" class="font-georgia">Georgia</option>'+
                               '<option value="Impact" class="font-impact">Impact</option>'+
                               '<option value="Times New Roman" class="font-times">Times New Roman</option>'+
                               '<option value="Trebuchet" class="font-trebuchet">Trebuchet</option>'+
                               '<option value="Verdana" class="font-verdana">Verdana</option>';

        var fontSizeValues = '<option value="8px">8px</option>'+
                             '<option value="9px">9px</option>'+
                             '<option value="10px">10px</option>'+
                             '<option value="11px">11px</option>'+
                             '<option value="12px">12px</option>'+
                             '<option value="13px">13px</option>'+
                             '<option value="14px">14px</option>'+
                             '<option value="15px">15px</option>'+
                             '<option value="16px">16px</option>'+
                             '<option value="17px">17px</option>'+
                             '<option value="18px">18px</option>';

        for (id in fonts[currentTheme]) {
          var selector = fonts[currentTheme][id].selector;
          var property = fonts[currentTheme][id].property;
          var s = (property == 'font-family') ? fontFamilyValues : fontSizeValues;
          var html = '<div class="form-item"><label for="'+ id +'">'+ fonts[currentTheme][id].label +'</label><select id='+ id +'>'+ s + '</select></div>';

          $("#cssmizer-fonts").append(html);
          $("#"+ id +">option[@value="+ themes[currentTheme].css[selector][property] +"]").attr("selected", "selected");

          $('#'+ id).change(function() {
            var selector = fonts[currentTheme][this.id].selector;
            var property = fonts[currentTheme][this.id].property;
            currentCSSObj[selector][property] = $(this).val();
            currentCSS = $.generateCSS(currentCSSObj);
            // this is much faster than using applyCSS() since we are only applying one attribute
            $(selector).css(property, $(this).val());
            $.buildCSS();
          });
        }
      }
    }
  };


  $.buildCSS = function() {
    // only execute if this div is found
    // if it isn't, then this functionality isn't needed
    if ($("#cssmizer-css").length > 0) {
      // update CSS textarea
      $("#css").val(currentCSS);

      // CSS tab
      $("#css").keyup(function() {
        if ($("#css-buttons").length < 1) {
          $("#css").after('<div id="css-buttons"><a href="#" id="apply" class="cssmizer-button apply">Apply</a><a href="#" id="revert" class="cssmizer-button revert">Revert</a><p>Please either apply or revert changes before switching tabs.</p></div>');
          $("#container").disableTab(1);
          $("#container").disableTab(2);
          $("#container").disableTab(3);
          $("#container").disableTab(5);

          $("#apply").click(function() {
            var css = $("#css").val();
            currentCSSObj = $.parseCSS(css);
            if (currentCSSObj) {
              $.applyCSS(currentCSSObj);
              $("#css-buttons").remove();
            }
            currentTheme = 'custom';
            $.buildThemes();
            $.buildFonts();
            $.buildColors();

            $("#container").enableTab(1);
            $("#container").enableTab(2);
            $("#container").enableTab(3);
            $("#container").enableTab(5);
          });

          $("#revert").click(function() {
            $("#css").val(currentCSS);
            $("#css-buttons").remove();
            $("#container").enableTab(1);
            $("#container").enableTab(2);
            $("#container").enableTab(3);
            $("#container").enableTab(5);
          });

        }
      });
    }
  };


  /**
   * Parse a snippet of CSS into a JS object.
   */
  $.parseCSS = function(css) {
    try {
      // remove whitespace around separators, but keep space around parentheses
      css = css.replace(/\s*([@{}:;,]|\)\s|\s\()\s*/g, "$1");
      // wrap all selectors in quotes
      css = css.replace(/([^{}:;]+)/g, "\'$1\'");
      // alter into JS object notation
      css = css.replace(/\'{/g, "\':{");
      css = css.replace(/;/g, ",");
      css = css.replace(/}/g, "},");
      // remove optional "," that IE chokes on
      css = css.replace(/\',}/g, "\'}");
      // remove last optional "," that IE chokes on
      css = css.replace(/},$/g, "}");
      // eval() needs the extra parantheses to prevent parsing errors
      return eval("({ "+ css +" })");
    }
    catch (error) {
      $("#warning").length > 0 ? '' : $("#css").before('<p id="warning">Unsupported CSS found. Please use simpler CSS.</p>');
      var removeWarning = function() { $("#warning").fadeOut(function() { $(this).remove(); }); };
      setTimeout(removeWarning, 3000);
      return false;
    }
  };


  /**
   * Generate CSS from a JS object.
   */
  $.generateCSS = function(cssObject) {
    var cssText = '';
    // loop through all selectors
    for (selector in cssObject) {
      cssText += selector +" {\n";
      // loop through all properties
      for (property in cssObject[selector]) {
        cssText += property +": "+ cssObject[selector][property] +";\n";
      }
      cssText += "}\n";
    }

    return cssText;
  };


  /**
   * Apply CSS to a web page in realtime.
   */
  $.applyCSS = function(cssObject) {
    // loop through all selectors
    for (selector in cssObject) {
      $(selector).css(cssObject[selector]);
    }
  };

})(jQuery);
