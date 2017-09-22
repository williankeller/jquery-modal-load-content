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
      // If container already been loaded.
      if ($(identifier.id).length) {
        $(identifier.id).addClass('loaded');

        return identifier.id;
      }
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
     * Action used to position the modal within the window.
     *
     * @returns {Boolean} false
     *   Return false to kill function.
     */
    var resizeModal = function () {
      // Kills function if modal is not opened.
      if (! $('.modal-load-content-container').hasClass('opened')) {
        return false;
      }

      // Working just with modal that contains opened class.
      var $modal = $('.modal-load-content-container.opened');

      // Reset the backdrop height/width to get accurate document size.
      $modal.removeAttr('style');

      // Get window width and height.
      var winHeight = $(window).height(),
        winWidth = $(window).width();
      // Get modal width and height.
      var modalHeight = $modal.outerHeight(),
        modalWidth = $modal.outerWidth();

      // Set window height to modal if it exceeds the maximum size.
      if (modalHeight >= winHeight) {
        modalHeight = (winHeight - 30);
      }
      // Set window width to modal if it exceeds the maximum size.
      if (modalWidth >= winWidth) {
        modalWidth = (winWidth - 30);
      }

      // Get and set the modal position into the window.
      var marginTop = (winHeight / 2) - (modalHeight / 2),
        marginLeft = (winWidth / 2) - (modalWidth / 2);

      // Apply the position changes.
      $modal.css('height', modalHeight)
        .css('width', modalWidth)
        .css('top', marginTop)
        .css('left', marginLeft);
    };

    /**
     * Open a modal by a provided container path.
     *
     * @param {string} path
     *   Route path of the link page.
     * @param {Boolean} loaded
     *   Status to check if modal is already loaded.
     */
    var openModal = function (container, loaded) {
      // Display overlay.
      $('.modal-load-content-overlay').addClass('opened');

      $(container).addClass('opened');
      debugging('opening', container);

      resizeModal();
    };

    /**
     * Closes current modal or all of them.
     */
    var closeModal = function (container) {
      var modal = container || '.modal-load-content-container.opened';
      // Hide modal.
      $(modal).removeClass('opened')
        // Reset the backdrop height/width to get accurate document size.
        .removeAttr('style');

      // Hide overlay.
      $('.modal-load-content-overlay').removeClass('opened');

      debugging('closing', 'modal');
    };

    /**
     * Work to load the content from a URL inside the modal container.
     *
     * @param {string} container
     * @param {string} destination
     * @returns {Boolean}
     */
    var loadContent = function (element, container, destination, callback) {
      // Check if containder is loaded already.
      if ($(container).hasClass('loaded')) {
        // Callback function.
        callback(container);

        return false;
      }

      // Specify a portion of the remote document to be inserted if exist.
      var target = [
        destination,
        $(element).data('target') || ''
      ];
      // Get full page if no target is defined.
      destination = target.join(' ');

      // Execute load action.
      $(container).load(destination, function (response, status, xhr) {
        // Any result different from success:
        if (status !== 'success') {
          $('<p/>', {
            'text': 'The requested page could not be loaded.',
            'class': 'modal-load-content-error'
          }).appendTo(container);

          debugging('load error', xhr.status + ' ' + xhr.statusText);
        }
        debugging('loaded from', destination);

        // Callback function.
        callback(response);
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

        // Build modal overlay content and insert into the body.
        buildModalOverlay();

        // Get href value from defined item.
        var href = getModalHref(element);

        // Filter and return a clean ID from a URL.
        var identifier = getModalIdentifier(href);

        // Build modal container to receive content that will be loaded.
        var container = buildModalContainer(identifier);

        // Work to load the content from a URL inside the modal container.
        loadContent(element, container, href, function () {

          // Open a modal by a provided container path as fallback.
          openModal(container);
        });
      });
      return false;
    };

    /**
     * Detect escape key press to hide modal.
     *
     * @event keyup
     */
    var detectKeyboardAction = function () {
      $(document).on('keyup', function (event) {
        if (event.keyCode === 27) {
          //  Closes current modal as global.
          closeModal();
        }
      });
    };

    /**
     * Detect click action under overlay.
     *
     * @event resize
     */
    var detectOverlayAction = function () {
      $(document).on('click', '.modal-load-content-overlay', function () {
        //  Closes current modal as global.
        closeModal();
      });
    };

    /**
     * Detect resize action to improve modal placement.
     *
     * @event resize
     */
    var detectResizeAction = function () {
      $(window).bind('resize', resizeModal);
    };

    /**
     * Return to render and build to each matched elements.
     */
    return this.each(function () {
      // Build the custom select elements.
      detectClickAction(this);

      // Detect escape key press to hide modal.
      detectKeyboardAction(this);

      // Detect resize action to improve modal placement.
      detectResizeAction(this);

      // Detect click action under overlay.
      detectOverlayAction(this);
    });
  };

})(jQuery);