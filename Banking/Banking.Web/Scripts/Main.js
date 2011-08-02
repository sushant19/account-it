//common UI message function
function showError(message) {
    $('#freeow').freeow("Error", message, { classes: ["smokey", "error"] });
}
//common UI modal function
function showModal(data) {
    $.modal(data, {
        onOpen: function (dialog) {
            dialog.overlay.fadeIn('normal', function () {
                dialog.container.slideDown('normal', function () {
                    dialog.data.fadeIn('normal');
                });
            });
        },
        onClose: function (dialog) {
            dialog.data.fadeOut('normal', function () {
                dialog.container.slideUp('normal', function () {
                    dialog.overlay.fadeOut('normal', function () {
                        $.modal.close(); // must call this!
                    });
                });
            });
        }
    });
}

//assigning of entities-based ajax behaviour
function assignBehavior(entityName) {

    // target should be jquery-wrapped object
    function parseId(target) {
        var query = { id: Number(target.attr('data-id')) }
        return query;
    }

    // /{Operation}/{View}{Operation}
    function makeUrl(actionName) {
        return '/' + entityName + '/' + actionName + entityName;
    }
    /*
    $('tr[data-id]').find('div:not([class])').live('click', function () {
        var target = $(this).parent().parent();
        target.prop("data-is-editing", "true");
        var url = makeUrl('Edit');

        var query = parseId(target);
        $.post(url, query, function (data) {
            if (data.error) {
                showError(data.error);
            } else {
                showModal(data);
            }
        }).error(function () { showError('Edit request failed'); });
    }).attr('title', 'Edit');
    */


    $('.operationTitle').live('click', function () {
        var url = 'Operation/EditOperation';
        var query = parseId($(this));
        $.post(url, query, function (data) {
            if (data.error) {
                showError(data.error);
            } else {
                showModal(data);
            }
        }).error(function () { showError('Edit request failed'); });
    });

    $('tr[data-id]').find('div[class="personDeals"] > ul').children().each(function () {
        $(this).live('click', function () {
            //TODO: ajax request and modal for deal (rearchitecture needed) 
        }).attr('title', 'Edit');
    });

    /*
    $('.deleteButton').live('click', function () {
        var ids = $.map($('tr'), function (row) {
            var checkbox = $(row).find('.itemCheck');
            if (checkbox.prop('checked') == true) {
                return $(row).attr('data-id');
            }
            else {
                return null;
            }
        });
        if (ids.length == 0) {
            showError("Select something first!");
        }
        else if (confirm('Are you sure?')) {
            var url = makeUrl('Delete');
            for (var i = 0; i < ids.length; i++) {
                var query = { id: ids[i] };
                $.post(url, query, function (data) {
                    if (data.error) {
                        showError(data.error);
                    } else {
                        $('tr').filter('[data-id=\"' + data.id + '\"]').remove();
                    }
                }).error(function () { showError('Delete request failed'); });
                //TODO: Sessions?
            }
        }
    });

    */

    /*
    $('.saveButton').live('click', function (e) {
        e.preventDefault();
        var url = makeUrl('Save');
        var target = $(this).parent().parent().parent();
        id = target.attr('data-id');
        var views = $('[data-id=' + id + ']');
        var query = parseFields(target);
        $.post(url, query, function (data) {
            if (data.error) {
                showError(data.error);
            }
            else {
                $.modal.close();
                //views are to detect in modal if we are creating new instance or editing existing one,
                //if we should add new row on modal close or replace existing one
                //TODO: right solution
                if (views.length > 1) {
                    views[0].replaceWith(data);
                }
                else {
                    AppendItem(data);
                }
            }
        }).error(function () { showError('Save request failed'); })
    });
    */
    /*
    $('.cancelButton').live('click', function () {
        $.modal.close();
    });
    */
    /*
    $('.createButton').live('click', function () {
        var url = makeUrl('Create');
        $.post(url, {}, function (data) {
            if (data.error) {
                showError(data.error)
            } else {
                showModal(data);
            }
        }).error(function () { showError('Create request failed'); })
    });
    */
}


/*
$(document).ready(function () {
    var target = $(".actionsMenu");
    if (target.length == 0) { return; }
    var padding = 11;     //11 cause .actionsMenu_fixed has 10px padding + 1 px for magic o_0
    var topOffset = target.offset().top;
    var leftOffset = target.offset().left;
    var docked = false;
    $(document).scroll(function () {
        var docOffset = $(document).scrollTop();
        if (!docked && docOffset > topOffset - padding) {
            target.parent().append(target.clone().prop("data-cloned", "true").css("visibility", "hidden"));
            target.addClass("actionsMenu_fixed");
            target.css({ top: '0px', left: leftOffset - padding + 'px' })
            docked = true;
        }
        else if (docked && docOffset <= topOffset - padding) {
            target.removeClass("actionsMenu_fixed");
            $(".actionsMenu").filter("[data-cloned]").remove();     //reselecting because of cloning
            docked = false;
        }
    });

});

*/