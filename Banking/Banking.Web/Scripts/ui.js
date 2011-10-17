/* dependencies */

//  jQuery 1.6+
//  jquery-data

(function () {
    var ui = {};
    this.ui = ui;
    $(document).ready(function () {
        stickActionsMenu();
        hideSelfLinks();
        ui.sortTable();
    });

    function callBack(func) {
        if (typeof (func) === 'function') {
            func();
        }
    }
    ui.overlay3 = new Servant({
        on: function (onComplete) {
            var overlay = $('#overlay');
            // creating overlay node if it's not present
            if (overlay.length === 0) {
                $('body').append('<div id="overlay"></div>');
                overlay = $('#overlay');
            }
            overlay.stop().fadeIn('slow', function () {
                onComplete();
            });
        },
        off: function () {
            var overlay = $('#overlay');
            overlay.stop().fadeOut('slow');
        }
    });

    ui.loading3 = new Servant({
        on: function (onComplete) {
            ui.disableControls();
            ui.overLoading = ui.overlay3.require(function () {
                if ($('#loading_wrapper').length === 0) {
                    $('#overlay').append('<div id="loading_wrapper"><div id="loading_message"><img src="../../Content/images/pacman_small.gif"> Loading...</div></div>');
                }
                $('#loading_wrapper').stop().slideDown('fast', function () {
                    onComplete();
                });
            }, 'overlay from loading');

        },
        off: function () {
            var wrapper = $('#loading_wrapper');
            $('#loading_wrapper').stop().slideUp('fast');
            ui.enableControls();
            ui.overLoading.release();
        }
    });

    ui.handleError = function (errName) {
        // map { errName: explanation }
        var explanations = {
            InvalidCode: 'Invalid code',
            AjaxRequestFailure: 'Server is unreachable',
            CannotDeletePersonThatHasOperations: 'Person who has operations cannot be deleted.',
            EmptyParticipantsList: 'Operation should have at least one participant.',
            NoPersonsDefined: 'There are no persons. Create somebody first.',
            PersonWithSameNameAlreadyExists: 'Person with same name already exists.',
            PersonCannotHaveReservedName: 'This name is reserved.',
            PersonCannotHaveEmptyName: 'Empty name is not allowed.',
            PersonalOperationNotFound: 'This person isn\'t participant anymore.',
            ViewNotFound: 'Requested view not found on server',
            IdNotFound: 'Entity with given ID not found on server'
        }
        // handling special cases
        if (errName === 'NotAuthorizedOrSessionExpired') {
            ui.showError('Session expired.<form action="../authorize"><button>log in</button></form>',
                { autoHide: false });
            // showing error explanations
        } else if (explanations[errName]) {
            ui.showError(explanations[errName]);
            // handling unknown errors
        } else {
            ui.showError(errName);
        }
    }

    ui.showModal = function (data) {
        $.modal(data, {
            onOpen: function (dialog) {
                ui.modalOpened = true;
                ui.overModal = ui.overlay3.require(function () {
                    $('.simplemodal-close').css('display', 'none');
                    dialog.container.slideDown('normal', function () {
                        dialog.data.fadeIn('normal');
                        $('.simplemodal-close').fadeIn('normal');
                        $('.simplemodal-container').find('input:first').focus();
                    });
                }, 'overlay from modal');

            },
            onClose: function (dialog) {
                ui.modalOpened = false;
                $('.Zebra_DatePicker').css('display', 'none');
                $('.simplemodal-close').fadeOut('normal');
                dialog.data.fadeOut('normal', function () {
                    dialog.container.slideUp('normal', function () {
                        ui.overModal.release();
                        $.modal.close();
                    });
                });
            },
            closeHTML: '<span></span>',
            overlayClose: true
        });
        ui.attachCalendar();
        ui.setFocus();
    }

    ui.showError = function (message, options) {
        defaultOptions = { classes: ["smokey", "error"] };
        for (option in options) {
            defaultOptions[option] = options[option];
        }
        $('#freeow').freeow("Error", message, defaultOptions);
    }

    // options - object:
    //      key - string: name of sorting key;
    //          if not defined, uses data-sort-key
    //      order - string: 'ascending', 'descending', 'current' or 'reverse';
    //          undefined or anything else equals 'current';
    //          'current' for first time equals 'ascending'.
    ui.sortTable = function (options) {
        // common string literals
        var ascending = 'ascending';
        var descending = 'descending';
        // undefined flags
        var optionsDefined = !isUndefined(options);
        var keyDefined = optionsDefined && !isUndefined(options.key);
        var orderDefined = optionsDefined && !isUndefined(options.order);
        // retrieving list of items
        var list = $('[data-list]').first();
        var items = $.makeArray(list.children());
        // determining key name and former order for sorting
        var keyName = keyDefined ? options.key : list.attr('data-sort-key');
        if (isUndefined(keyName)) {
            return;
        }
        var currentOrder = list.attr('data-sort-order');
        if (!validOrder(currentOrder)) {
            currentOrder = ascending;     // current order is 'ascending' by default
        }
        // determining actual order for sorting
        var newOrder;
        if (orderDefined && validOrder(options.order)) {
            newOrder = options.order;
        } else if (orderDefined && options.order === 'reverse') {
            newOrder = (currentOrder === ascending ? descending : ascending);
        } else {
            newOrder = currentOrder;
        }
        // removing css classes from sorting controls
        $(document).findByData({ action: 'sort' }).each(function () {
            $(this).removeClass('headerSortUp').removeClass('headerSortDown');
        })
        // adding css classes to current sorting cotrol
        var sortControl = $(document).findByData({ action: 'sort', 'sort-key': keyName });
        var sortClass = (newOrder === ascending) ? 'headerSortDown' : 'headerSortUp';
        sortControl.addClass(sortClass);
        // sorting and updating items
        var sorted = naturalSort(items, extractKey);
        list.empty();
        for (i in sorted) {
            if (newOrder === ascending) {
                list.append(sorted[i]);
            } else {
                list.prepend(sorted[i]);
            }
        }
        // updating list attributes according to new sorting
        list.attr('data-sort-key', keyName);
        list.attr('data-sort-order', newOrder);
        // item => string
        function extractKey(item) {
            var keyContainer = $(item).findByData({ 'sort-key': keyName });
            var keyValue = keyContainer.attr('data-sort-value');
            // if data-sort-value is undefined, than content is used as value
            if (isUndefined(keyValue)) {
                keyValue = keyContainer.html();
            }
            return keyValue.toLowerCase();
        };
        // checks for undefined
        function isUndefined(something) {
            return (typeof (something) === 'undefined');
        }
        // valid order names are only 'ascending' and 'descending';
        // 'current' and 'reverse' are just for convenience
        function validOrder(orderName) {
            return (orderName === ascending || orderName === descending);
        }
    };

    function stickActionsMenu() {
        var target = $(".actionsMenu");
        if (target.length == 0) { return; }
        var padding = 10;     // 11 cause .actionsMenu_fixed has 10px padding + 1 px for magic o_0
        var topOffset = target.offset().top;
        var leftOffset = target.offset().left;
        var docked = false;
        $(document).scroll(function () {
            var target = $(".actionsMenu");
            if (target.length == 0) { return; }
            var leftOffset = target.offset().left;
            var docOffset = $(document).scrollTop();
            if (!docked && docOffset > topOffset - padding) {
                target.parent().append(
                target.clone()
                    .attr("data-cloned", "true")
                    .css("visibility", "hidden"));
                target.wrap('<div class="actionsMenu_fixed" />');
                target.parent().css({ top: '0px', left: '0px', right: '0px' })
                target.css({ top: '0px', left: leftOffset + 'px' })
                docked = true;
            }
            else if (docked && docOffset <= topOffset - padding) {
                $('.actionsMenu_fixed').remove()
                $(".actionsMenu").filter("[data-cloned]").css('visibility', 'visible')
                    .removeAttr('data-cloned');     // reselecting because of cloning  
                docked = false;
            }
        });
    }

    function hideSelfLinks() {
        function hrefSelector(href) {
            return '[href=\"' + href + '\"]';
        }
        var href = window.location.href;
        var pathname = window.location.pathname;
        var search = window.location.search.substring();
        $('a')
            .filter(hrefSelector(href) + ', ' + hrefSelector(pathname + search))
                .each(function () {
                    $(this).replaceWith($(this).html());
                });
    }

    ui.attachCalendar = function () {
        $('.datePicker_wrapper>input').Zebra_DatePicker({
            format: 'j.m.Y',
            readonly_element: false
        });
    }

    // disables buttons that are not already disabled
    ui.disableControls = function () {
        $('button').filter('[data-action]').each(function () {
            disable($(this));
        });

        function disable(button) {
            if (button.prop('disabled') === false) {
                button.attr('disabled', 'disabled').attr('data-disabled', 'true');
            }
        }
    }

    // enables previously disabled buttons
    ui.enableControls = function () {
        $('button').filter('[data-action]').filter('[data-disabled]')
            .removeAttr('disabled')
            .removeAttr('data-disabled');
    }

    ui.setFocus = function () {
        var focused = $('.focus:last');
        focused.focus();
    }

})();