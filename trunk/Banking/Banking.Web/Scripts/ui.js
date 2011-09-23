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
        //activateTableSorter();
    });

    ui.handleError = function (err) {
        switch (err) {
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
                dialog.overlay.fadeIn('normal', function () {
                    $('.simplemodal-close').css('display', 'none');
                    dialog.container.slideDown('normal', function () {
                        dialog.data.fadeIn('normal');
                        $('.simplemodal-close').fadeIn('normal');
                        $('.simplemodal-container').find('input:first').focus();
                    });
                });

            },
            onClose: function (dialog) {
                $('.simplemodal-close').fadeOut('normal');
                dialog.data.fadeOut('normal', function () {
                    dialog.container.slideUp('normal', function () {
                        dialog.overlay.fadeOut('normal', function () {
                            $.modal.close(); // must call this!
                        });
                    });
                });
            },
            closeHTML: '<span></span>',
            overlayClose: true
        });
        ui.attachCalendar();

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

    ui.disableControls = function () {
        $('button').filterByData({ 'action': 'delete' }).each(function () {disableButton(this); });
        $('button').filterByData({ 'action': 'save' }).each(function () { disableButton(this); });
        $('button').filterByData({ 'action': 'restore' }).each(function () { disableButton(this); });
        $('button').filterByData({ 'action': 'create' }).each(function () { disableButton(this); });
        $('button').filterByData({ 'action': 'import' }).each(function () { disableButton(this); });
        $('button').filterByData({ 'action': 'saveImport' }).each(function () { disableButton(this); });
        $('button').filterByData({ 'action': 'restoreBackup' }).each(function () { disableButton(this); });
        //TODO rewrite this and 2 next functions — add more beaty
    }
    ui.enableControls = function () {
        $('button').filterByData({ 'action': 'delete', 'disabled': 'true' }).each(function () { $(this).removeAttr('disabled').removeAttr('data-disabled'); });
        $('button').filterByData({ 'action': 'save', 'disabled': 'true' }).each(function () { $(this).removeAttr('disabled').removeAttr('data-disabled'); });
        $('button').filterByData({ 'action': 'restore', 'disabled': 'true' }).each(function () { $(this).removeAttr('disabled').removeAttr('data-disabled'); });
        $('button').filterByData({ 'action': 'create', 'disabled': 'true' }).each(function () { $(this).removeAttr('disabled').removeAttr('data-disabled'); });
        $('button').filterByData({ 'action': 'import', 'disabled': 'true' }).each(function () { $(this).removeAttr('disabled').removeAttr('data-disabled'); });
        $('button').filterByData({ 'action': 'saveImport', 'disabled': 'true' }).each(function () { $(this).removeAttr('disabled').removeAttr('data-disabled'); });
        $('button').filterByData({ 'action': 'restoreBackup', 'disabled': 'true' }).each(function () { $(this).removeAttr('disabled').removeAttr('data-disabled'); });
    }
    function disableButton(button) {
        elem = $(button);
        if (elem.prop('disabled') === false) {
            elem.attr('disabled', 'disabled').attr('data-disabled', 'true');
        }
    }

})();