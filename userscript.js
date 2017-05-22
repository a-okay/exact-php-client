// ==UserScript==
// @name        PHP SDK Entity generator
// @namespace   php
// @description Generates php class that can be used in SDK
// @include     https://start.exactonline.nl/docs/HlpRestAPIResourcesDetails.aspx?*
// @version     1
// @grant       none
// ==/UserScript==

(function() {
  var instant_download = false;
  var debug = false;

  /** Adding requred ellements **/
  // Add download button and show it if prefered.
  $('<a />', {
    id : 'php_download',
    text: 'Download Code',
    style: 'margin: 10px; padding: 10px; color: white; background-color: red; display: none;'
  }).prependTo('body');

  if (instant_download === false) {
    $('<br /><br />').insertAfter('#php_download');
    $('#php_download').show();
  }

  // Add textarea for instant results when debuging.
  if (debug) {
    // Push current content to the left.
    $('body > form').css('float', 'left');
    $('body > form').css('width', '50%');
    $('body > form').css('overflow', 'auto');

    $('<textarea/>', {
      id : 'php_debug',
      style: 'min-height:800px; width: 47%; margin-left:10px;'
    }).appendTo('body');
  }

  /** Initialize variables **/
  var primarykey = 'ID';
  var data = {};
  // Fetch entity URL and strip '/api/v1/{division}/'
  var url = $('#serviceUri').text().replace(/^\/api\/v[0-9]\/[^/]+\//, '');
  var classname = url.replace(/.+\/(.+?)s?$/,'$1'); // Last part after slash should be the (plural) classname.

  /** Fetch attribute information **/
  $('#referencetable tr input').each(function() {
    data[$(this).attr('name')] = {
      'type' : $(this).attr('data-type').replace('Edm.', ''),
      'description' : $(this).parent().siblings('td:last-child').text().trim()
    };

    // Set primarykey when found. Should be first itteration.
    if ($(this).attr('data-key') == "True") {
      primarykey = $(this).attr('name');
    }
  });

  /** Build php code **/
  phptxt = "<?php namespace Picqer\\Financials\\Exact;\n\n/**";

  // Build docblock
  phptxt += "\n * Class " + classname;
  phptxt += "\n *\n * @package Picqer\\Financials\\Exact";
  phptxt += "\n * @see " + window.location.href;
  phptxt += "\n *";
  $.each(data, function(attribute, info){
    phptxt += "\n * @property " + info.type + " $" + attribute + " " + info.description;
  });
  phptxt += "\n */";

  // Build class
  phptxt += "\nclass " + classname + " extends Model\n{\n\n    use Query\\Findable;\n    use Persistance\\Storable;";
  if (primarykey != 'ID') {
    phptxt += "\n\n    protected $primaryKey = '" + primarykey + "';";
  }
  phptxt += "\n\n    protected $fillable = [";
  $.each(Object.keys(data), function(){
    phptxt += "\n        '" + this + "',";
  });
  phptxt += "\n    ];";
  phptxt += "\n\n    protected $url = '" + url + "';";
  phptxt += "\n\n}";

  // Display php code
  $('#php_debug').text(phptxt);

  // Present the php code as a download
  $('#php_download').attr("href",
    URL.createObjectURL(
      new Blob([phptxt], {
        type: "text/plain"
      })
    )
  ).attr('download', classname + '.php');

  if (instant_download)
  {
    $('#php_download')[0].click();
  }
})();
