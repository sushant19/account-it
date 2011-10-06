/* dependencies */

//  jQuery 1.6+
//  jquery-data

(function () {
    var ui = { modalOpened: false, overlayed: false };
    this.ui = ui;
    $(document).ready(function () {
        stickActionsMenu();
        hideSelfLinks();
        ui.sortTable();
    });

    ui.overlayNew = new Toggle('OFF', true, {
        on: function (onComplete) {
            console.log('overlay ON handler started');
            var overlay = $('#overlay');
            // creating overlay node if it's not present
            if (overlay.length === 0) {
                $('body').append('<div id="overlay"></div>');
                overlay = $('#overlay');
            }
            overlay.stop().fadeIn('slow', function () {
                console.log('overlay ON handler completed');
                onComplete();
            });
        },
        off: function (onComplete) {
            console.log('overlay OFF handler started');
            var overlay = $('#overlay');
            overlay.stop().fadeOut('slow', function () {
                console.log('overlay OFF handler completed');
                onComplete();
            });
        }
    });

    ui.loadingNew = new Toggle('OFF', true, {
        on: function (onComplete) {
            ui.disableControls();
            ui.overlayNew.on(function () {
                console.log('callback from loading start');
                var wrapper = $('#loading_wrapper');
                if (wrapper.length === 0)
                    $('#overlay').append('<div id="loading_wrapper"><div id="loading_message"><img src="../../Content/images/pacman_small.gif"> Loading...</div></div>');
                wrapper.stop().slideDown('fast');
            });
            var wrapper = $('#loading_wrapper');
            if (wrapper.length === 0)
                $('#overlay').append('<div id="loading_wrapper"><div id="loading_message"><img src="../../Content/images/pacman_small.gif"> Loading...</div></div>');
        },
        off: function (onComplete) {
            ui.enableControls();
            var message = $('#loading_wrapper');
            message.stop().slideUp('fast', function () {
                if (!ui.modalOpened) {
                    ui.overlayNew.off(function () {
                        console.log('callback from loding finish');
                        message.remove();
                    });
                } else {
                    console.log('callback from loding finish');
                    message.remove();
                }
            });
        }
    });

    ui.handleError = function (err) {
        switch (err) {
            case 'AjaxRequestFailure':
                ui.showError('Server is unreachable')
                break;
            case 'NotAuthorizedOrSessionExpired':
                ui.showError('Session expired.<form action="../authorize"><button>log in</button></form>', { autoHide: false })
                break;
            case 'CannotDeletePersonThatHasOperations':
                ui.showError('Person who has operations cannot be deleted. Uncheck or remove all his / her operations first.');
                break;
            case 'EmptyParticipantsList':
                ui.showError('Operation should have at least one participant.');
                break;
            case 'NoPersonsDefined':
                ui.showError('There are no persons - so create somebody first.');
                break;
            case 'PersonWithSameNameAlreadyExists':
                ui.showError('Person with same name already exists.');
                break;
            case 'PersonCannotHaveReservedName':
                ui.showError('This name is reserved.');
                break;
            case 'PersonCannotHaveEmptyName':
                ui.showError('You can not create person with empty name.');
                break;
            case 'PersonalOperationNotFound':
                ui.showError('This person isn\'t participant anymore.');
                break;
            case 'ViewNotFound':
                ui.showError('Requested view not found on the server.');
                break;
            case 'IdNotFound':
                ui.showError('Entity with given ID not found on the server.');
                break;
            case 'InvalidCode':
                ui.showError('Invalid code.');
                break;

            default:
                ui.showError(err);
        }
    }

    ui.showModal = function (data) {
        $.modal(data, {
            onOpen: function (dialog) {
                ui.modalOpened = true;
                ui.overlayNew.on(function () {
                    console.log('callback from showModal onOpen');
                    // hiding close button
                    $('.simplemodal-close').css('display', 'none');
                    // showing content
                    dialog.container.slideDown('normal', function () {
                        dialog.data.fadeIn('normal');
                        //showing close button
                        $('.simplemodal-close').fadeIn('normal');
                        // setting focus
                        $('.simplemodal-container').find('input:first').focus();
                    });
                });

            },
            onClose: function (dialog) {
                ui.modalOpened = false;
                $('.simplemodal-close').fadeOut('normal');
                dialog.data.fadeOut('normal', function () {
                    dialog.container.slideUp('normal', function () {
                        ui.overlayNew.off(function () {
                            console.log('callback from showModal onClose');
                            $.modal.close();
                        });
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

    ui.loading = function (state) {
        //console.log('loading: entered with state "' + state + '", overlay: ' + ui.overlayed);
        if ('start' === state) {
            ui.disableControls();
            ui.overlayNew.on(function () {
                console.log('callback from loading start');
                var wrapper = $('#loading_wrapper');
                if (wrapper.length === 0)
                    $('#overlay').append('<div id="loading_wrapper"><div id="loading_message"><img src="../../Content/images/pacman_small.gif"> Loading...</div></div>');
                wrapper.stop().slideDown('fast');
            });
            var wrapper = $('#loading_wrapper');
            if (wrapper.length === 0)
                $('#overlay').append('<div id="loading_wrapper"><div id="loading_message"><img src="../../Content/images/pacman_small.gif"> Loading...</div></div>');
        }
        else if ('finish' === state) {
            ui.enableControls();
            var message = $('#loading_wrapper');
            message.stop().slideUp('fast', function () {
                if (!ui.modalOpened) {
                    ui.overlayNew.off(function () {
                        console.log('callback from loding finish');
                        message.remove();
                    });
                }
            });
        }
    }

    ui.overlay = function (action, callback) {
        // overlay hidden, show requested
        if ('show' === action && !ui.overlayed) {
            $('body').append('<div id="overlay"></div>');
            //                $('#overlay').bind('click', function () {
            //                    ui.overlay('hide');
            //                });
        }
        // no state change needed - only callback
        if (('show' === action && ui.overlayed) || ('hide' === action && !ui.overlayed)) {
            if (callback && typeof (callback) === "function") {
                callback();
            }
            return;
        }
        // state change needed - switching...
        else {
            var overlay = $('#overlay');
            overlay.stop().fadeToggle(function () {
                if (callback && typeof (callback) === "function") {
                    if (!ui.overlayed)
                        overlay.remove();
                    callback();
                }
            });
            //switching state flags
            if (ui.overlayed)
                ui.overlayed = false;
            else
                ui.overlayed = true;
        }

    }

    ui.setFocus = function () {
        var focused = $('.focus:last');
        focused.focus();
    }

})();