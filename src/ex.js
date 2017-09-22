/**
 * @file
 * Modal Gallery.
 *
 * Provides a behavior to load and open a modal with
 * a loads another internal page conten inside.
 */

(function ($) {

  "use strict";

  /**
   * Attaches the modal actions behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Detect all of the action to handle the modal
   *   like CTA click and escape key press.
   */
  Drupal.behaviors.modalGallery = {
    attach: function (context) {
      // Instantiate modalGallery behavior as global MG.
      var MG = Drupal.behaviors.modalGallery;

      /**
       * Detect taco image click and CTA click to open modal and prevent redirect.
       *
       * @event click
       */
      $(document).on('click', '.open-modal-gallery', function (event) {
        event.preventDefault();
        // Call to start all modal functions.
        // Regex to get all paths after first slash.
        var path = MG.getModalPath($(this));

        if (! MG.isLoadedModal(path)) {
          // Build modal structure and append to body content.
          MG.buildModal(path);

          // Load main content of another internal page.
          MG.loadModal(path);

          // Open modal with content to be loaded.
          MG.openModal(path, false);

          // Kill event, just open the modal here.
          return false;
        }
        // Open already loaded modal by a provided path.
        MG.openModal(path, true);
      });

      /**
       * Detect click action on close button.
       *
       * @event click
       */
      $(document).on('click', '.modal-gallery-close, .modal-gallery-overlay', MG.closeModal);

      /**
       * Detect escape key press to hide modal.
       *
       * @event keyup
       */
      $(document).on('keyup', function (event) {
        if (event.keyCode === 27) {
          //  Closes current modal as global.
          MG.closeModal();
        }
      });

      /**
       * Detect resize action to improve modal placement.
       *
       * @event resize
       */
      $(window).bind('resize', MG.modalResize);

      /**
       * Open modal if url have a fragment in url.
       *
       * @event ready
       */
      $(document).ready(function () {
        // Set all href clicable when has the same URL of the Taco.
        MG.setClicableTacoLinks(context);

        // pen modal with the related URL fragment.
        MG.openModalFromUrlFragment(context);
      });
    },

    /**
     * Set all href clicable when has the same URL of the Taco.
     *
     * @param {Object} context
     *   Drupal context.
     * @returns {Boolean}
     *   return false to clear doom.
     */
    setClicableTacoLinks: function (context) {
      // Get globally taco CTA url.
      $('.modal-gallery-taco', context).each(function () {
        // Search just the href into the call to action.
        var $href = $(this).find('.call-to-action').find('a').attr('href');

        // Back to the modal-gallery-taco parent.
        $(this).find('a').each(function () {
          // Check if is the same URL as CTA.
          if ($href === $(this).attr('href')) {
            $(this).addClass('open-modal-gallery');
          }
        });
      });
      return false;
    },

    /**
     * Open modal with the related URL fragment.
     *
     * @returns {Boolean} false
     *   Return false to kill function.
     */
    openModalFromUrlFragment: function (context) {
      // Check if exist modal.
      if (window.location.hash) {
        // Get fragment from URL.
        var fragment = window.location.hash.substring(1);

        // Search all links into modal-gallery-taco taco.
        $('.modal-gallery-taco', context).find('a').each(function () {
          // Filter URL ro load modal.
          var uri = Drupal.behaviors.modalGallery.getModalPath($(this));

          // Check if exist some tout that contain this fragment.
          if (uri.replace(/\//, '') === fragment) {
            // Simulate click action to open modal and stop loop.
            $(this).click();
            return false;
          }
        });
      }
    },

    /**
     * Regex to get all paths after first slash.
     *
     * @param {string} href
     *   Full route to the clicked CTA page.
     * @returns {string} path
     *   Route path of the link page.
     */
    getModalPath: function (href) {
      return href.attr('href').replace(/^.*\/\/[^\/]+/, '');
    },

    /**
     * To check if modal already is loaded.
     *
     * @param {string} path
     *   Route path of the link page.
     * @returns {Boolean}
     *   True if modal already is loaded.
     */
    isLoadedModal: function (path) {
      // Convert slash to hyphen and make a clean identifier.
      var identifier = path.replace(/\//g, '-');

      if ($('#modal' + identifier).length) {
        return true;
      }
      return false;
    },

    /**
     * Build modal structure and appent to website content.
     *
     * @param {string} path
     *   Route path of the link page.
     */
    buildModal: function (path) {
      // Convert slash to hyphen and make a clean identifier.
      var identifier = path.replace(/\//g, '-');

      // Build overlay if still doesn't exist.
      if (! $('.modal-gallery-overlay').length) {
        $('<div/>', {
          'class': 'modal-gallery-overlay'
        }).appendTo('body');
      }

      // Build div to modal and inject into body.
      $('<div/>', {
        'class': 'modal-gallery-content',
        'id': 'modal' + identifier
      }).appendTo('body');
    },

    /**
     * Action used to position the modal within the window.
     *
     * @returns {Boolean} false
     *   Return false to kill function.
     */
    modalResize: function () {
      // Kills function if modal is not already open.
      if (! $('.modal-gallery-content').hasClass('opened')) {
        return false;
      }
      // Working just with modal that contains opened class.
      var $modal = $('.modal-gallery-content.opened');

      // Reset the backdrop height/width to get accurate document size.
      $modal.attr('style', '');

      // Get window and modal width and height.
      var winHeight = $(window).height(),
        winWidth = $(window).width(),
        modalHeight = $modal.height(),
        modalWidth = $modal.width();

      // Set window size to modal if it exceeds the maximum size.
      if (modalHeight >= winHeight) {
        modalHeight = (winHeight - 30);
      }
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
    },

    /**
     * Load main content content of an another internal page.
     *
     * @param {string} path
     *   Route path of the link page.
     */
    loadModal: function (path) {
      // Convert slash to hyphen and make a clean identifier.
      var identifier = path.replace(/\//g, '-'),
        $modal = $('#modal' + identifier),
        // Instantiate modalGallery behavior as global MG.
        MG = Drupal.behaviors.modalGallery;

      // Load content to modal. E.g.: #modal-example-url
      $modal.load(path + '?modal=1 #workflow-workbench,#main-content', function (response, status, xhr) {

        // If response status is different from success.
        if (status !== 'success') {
          // Close modal.
          $('<p/>', {
            'text': Drupal.t('The requested page could not be found.'),
            'class': 'modal-gallery-error'
          }).appendTo($modal);
        }

        // Display modal with content inside.
        $modal.addClass('opened')
          // Append close button.
          .prepend('<span class="modal-gallery-close">x</span>')
          // Remove ID attribute to avoid duplicated IDs.
          .children()
          .removeAttr('id');

        // Action required to update the modal size after the image load.
        $('img', $modal).one('load', function () {
          // Used to update the modal position for each loaded image.
          MG.modalResize();
        });
        // Used to position the modal within the window globally.
        MG.modalResize();

        // Add class when all is loaded.
        $modal.addClass('loaded');
      });
    },

    /**
     * Open a modal by a provided path.
     *
     * @param {string} path
     *   Route path of the link page.
     * @param {Boolean} loaded
     *   Status to check if modal is already loaded.
     */
    openModal: function (path, loaded) {
      // Convert slash to hyphen and make a clean identifier.
      var identifier = path.replace(/\//g, '-');

      // Display overlay.
      $('.modal-gallery-overlay').addClass('opened');

      if (loaded === true) {
        var $modal = $('#modal' + identifier);

        // Display modal content.
        $modal.addClass('opened');

        // Action required to fade-in animation.
        setTimeout(function () {
          $modal.addClass('loaded');
        }, 10);

        // Action used to position the modal within the window.
        Drupal.behaviors.modalGallery.modalResize();
      }
    },

    /**
     * Closes current modal or all of them.
     */
    closeModal: function () {
      // Hide modal.
      $('.modal-gallery-content')
        .removeClass('opened')
        .removeClass('loaded')
        // Reset the backdrop height/width to get accurate document size.
        .attr('style', '');

      // Hide overlay.
      $('.modal-gallery-overlay').removeClass('opened');
    }
  };

})(jQuery);