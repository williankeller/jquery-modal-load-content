(function ($, window, document) {
  "use strict";

  $.fn.modalLoadContent = function (options) {

    /**
     * Default configuration parameters.
     *
     * @type {Object}
     */
    var defaults = {
      // If true print process steps under console.
      debugMode: false,

      // Default modal classes.
      overlayClass: '.modal-load-content-overlay',
      containerClass: '.modal-load-content-container',

      // Modal close definitions.
      closeButtonClass: '.modal-load-content-close',
      closeButtonIcon: '[Close]',
      closeButtonText: 'Close modal',

      // Default settings to error.
      errorClass: 'modal-load-content-error',
      errorText: 'The requested page could not be loaded.'
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

      // Return identifier ID and number.
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
      if (! $(settings.overlayClass).length) {
        $('<div/>', {
          'class': settings.overlayClass.replace('.', '')
        }).appendTo('body');
      }
    };

    /**
     * Build modal container to receive content that will be loaded.
     *
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
        'class': settings.containerClass.replace('.', ''),
        'id': identifier.text
      }).appendTo('body');

      debugging('build', identifier.id);

      return identifier.id;
    };

    /**
     * Action used to position the modal within the window.
     *
     * @returns {Boolean} false
     *   Return false to kill function.
     */
    var resizeModal = function () {
      // Kills function if modal is not opened.
      if (! $(settings.containerClass).hasClass('opened')) {
        return false;
      }

      // Working just with modal that contains opened class.
      var $modal = $(settings.containerClass + '.opened');

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
     * @param {string} container
     *   Route path of the link page.
     */
    var openModal = function (container) {
      // Display overlay.
      $(settings.overlayClass).addClass('opened');

      // Display modal container.
      $(container).addClass('opened');

      // Resize modal after open to avoid image load.
      resizeModal();

      debugging('opening', container);
    };

    /**
     * Closes current modal or all of them.
     */
    var closeModal = function () {
      var modal = settings.containerClass + '.opened';
      // Hide modal.
      $(modal).removeClass('opened')
        // Reset the backdrop height/width to get accurate document size.
        .removeAttr('style');

      // Hide overlay.
      $(settings.overlayClass).removeClass('opened');

      debugging('closing', 'modal');
    };

    /**
     * Work to load the content from a URL inside the modal container.
     *
     * @param {DOM} element
     * @param {string} container
     * @param {string} destination
     * @callback {function} callback
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
        // Create and append close button.
        $('<span/>', {
          'class': settings.closeButtonClass.replace('.', ''),
          'title': settings.closeButtonText,
          'text': settings.closeButtonIcon
        }).appendTo(container);

        debugging('loaded from', destination);

        // Any result different from success:
        if (status !== 'success') {
          $('<p/>', {
            'text': settings.errorText,
            'class': settings.errorClass
          }).appendTo(container);

          debugging('load error', xhr.status + ' ' + xhr.statusText);
        }
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
      // Click at link event.
      $(element).on('click', function (event) {
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
     * Open modal with the related URL fragment.
     *
     * @param {DOM} elements
     * @returns {Boolean} false
     */
    var detectUrlFragment = function (elements) {
      // Check if exist modal.
      if (window.location.hash) {
        // Get fragment from URL.
        var fragment = window.location.hash.substring(1);

        // Search all links into modal-gallery-taco taco.
        elements.each(function () {
          // Filter URL ro load modal.
          var href = getModalHref($(this));

          // Check if exist some tout that contain this fragment.
          if (href === fragment) {
            // Simulate click action to open modal and stop loop.
            $(this).click();
          }
        });
      }
      return false;
    };

    /**
     * Function to bind actions to close modal.
     */
    var detectActionsToClose = function () {
      // Detect escape key press to hide modal.
      $(document).on('keyup', function (event) {
        if (event.keyCode === 27) {
          //  Closes current modal as global.
          closeModal();
        }
      });
      // Detect click at overlay area.
      $(document).on('click', settings.overlayClass, closeModal);
      // Detect click at close button.
      $(document).on('click', settings.closeButtonClass, closeModal);
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
     * Function to init the modal handlers.
     *
     * @param {DOM} elements
     * @returns {DOM}
     */
    var init = function (elements) {
      elements.each(function () {
        // Build the custom select elements.
        detectClickAction(this);
      });
      // Open modal with the related URL fragment.
      detectUrlFragment(elements);
      // Detect resize action to improve modal placement.
      detectResizeAction();
      // Detect click action under overlay.
      detectActionsToClose();

      return elements;
    };

    /**
     * Return to render and build to each matched elements.
     */
    return init(this);
  };

})(jQuery, window, document);