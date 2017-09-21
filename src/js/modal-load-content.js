(function ($) {

  "use strict";

  $.fn.modalLoadContent = function (options) {
    /**
     * Default configuration parameters.
     *
     * @type {Object}
     */
    var defaults = {
      // If true print process steps under console.
      debugMode: false
    };
    // Merging settings.
    var settings = $.extend({}, defaults, options);

    /**
     * Print messages in console if enabled.
     *
     * @param {string} label
     * @param {string} message
     */
    var debugging = function (label, message) {
      // Check if is enabled in settings.
      if (settings.debugMode === true) {
        console.log('modalLoadContent:', label + ':', message);
      }
    };

    /**
     * Get href value from defined item.
     *
     * @param {DOM} element
     * @returns {string}
     */
    var getModalHref = function (element) {
      var $element = $(element),
        // Get from data attribute or default href attribute.
        href = $element.data('href') || $element.attr('href');

      return href;
    };

    /**
     * Filter and return a clean ID from a URL.
     *
     * @param {string} href
     * @param {Boolean} isID
     * @returns {Object}
     */
    var getModalIdentifier = function (href) {
      // Replace all spaces to hiphen.
      var hash = href.replace(/[^a-zA-Z0-9]+/g, '-');
      // Check if must return with ID.

      return {
        id: '#modal-load-content-' + hash,
        text: 'modal-load-content-' + hash
      };
    };

    /**
     * Build modal overlay content and insert into the body.
     */
    var buildModalOverlay = function () {
      // Build overlay if still doesn't exist.
      if (! $('.modal-load-content-overlay').length) {
        $('<div/>', {
          'class': 'modal-load-content-overlay'
        }).appendTo('body');
      }
    };

    /**
     * Build modal container to receive content that will be loaded.
     *
     * @param {Object} element
     * @returns {string} identifier
     */
    var buildModalContainer = function (identifier) {

      // Build div to modal and inject into body.
      $('<div/>', {
        'class': 'modal-load-content-container',
        'id': identifier.text
      }).appendTo('body');

      debugging('build', identifier.id);

      return identifier.id;
    };

    /**
     * Remove created modal container from DOM.
     *
     * @param {string} modal
     */
    var removeModalContainer = function (container) {
      $(container).remove();

      debugging('modal removed', container);
    };

    /**
     * Work to load the content from a URL inside the modal container.
     *
     * @param {string} container
     * @param {string} href
     * @returns {Boolean}
     */
    var loadContent = function (container, href) {

      $(container).load(href, function (response, status, xhr) {
        if (status !== 'success') {
          $('<p/>', {
            'text': 'The requested page could not be loaded.',
            'class': 'modal-load-content-error'
          }).appendTo(container);

          debugging('load error', xhr.status + ' ' + xhr.statusText);

          // Kill load function.
          return false;
        }
        debugging('loaded from', href);
      });
    };

    /**
     * Detect click action and build modal elements.
     *
     * @param {DOM} element
     * @returns {Boolean}
     */
    var detectClickAction = function (element) {
      var $element = $(element);

      $element.on('click', function (event) {
        event.preventDefault();

        // Get href value from defined item.
        var href = getModalHref(element);
        // Filter and return a clean ID from a URL.
        var identifier = getModalIdentifier(href);
        // Build modal container to receive content that will be loaded.
        var container = buildModalContainer(identifier);
        // Work to load the content from a URL inside the modal container.
        loadContent(container, href);
      });
      return false;
    };


    /**
     * Return to render and build to each matched elements.
     */
    return this.each(function () {
      // Build the custom select elements.
      detectClickAction(this);
    });
  };

})(jQuery);