﻿/* dependencies */

//  jQuery 1.6+ 
//  jquery-data
//  act.js

(function () {

    // *** registering parse functions ***

    act.bind('parse_operation', parseOperation);
    act.bind('parse_person', parsePerson);

    // *** binding user actions ***

    bindAction('select', 'click', function () {
        var view = findParentView(this, 'viewRow');
        toggleSelection(view);
    });

    bindAction('selectAll', 'click', function () {
        var currentControl = $(this);
        var checked = currentControl.attr('checked');
        var entityName = currentControl.parseData('entity');
        var views = $(document).findByData({ view: 'viewRow', entity: entityName });
        views.each(function () {
            var currentView = $(this);
            if (checked == 'checked') {
                applySelection(currentView);
            } else {
                removeSelection(currentView);
            }
        });
    });

    bindAction('create', 'click', function () {
        var entityName = $(this).parseData('entity');
        sendRequest('Create', entityName, {}, function (response) {
            ui.showModal(response);
        });
    });

    bindAction('delete', 'click', function () {
        var entityName = $(this).parseData('entity');
        var selected = $(document).findByData({ view: 'viewRow', selected: 'true', entity: entityName });
        var count = selected.length;
        if (confirm('Delete ' + count + ' ' + entityName + ' forever?')) {        //TODO: rewrite confirmation to modal
            selected.each(function () {
                var current = $(this);
                var id = current.attr('data-id');
                sendRequest('Delete', entityName, { id: id }, function (response) {
                    current.remove();
                    refreshDeleteControls();
                });
            });
        }
    });

    bindAction('edit', 'click', function () {
        var view = findParentView(this);
        var entityName = view.parseData('entity');
        var id = view.parseData('id');
        sendRequest('edit', entityName, { id: id }, function (response) {
            ui.showModal(response);
        });
    });

    bindAction('save', 'click', function (event) {
        event.preventDefault();
        var view = findParentView(this, 'edit');
        var entityName = view.parseData('entity');
        // call by name...
        var data = act('parse_' + entityName, view);
        sendRequest('save', entityName, data, function (response) {
            updateViews(entityName, response);
            $.modal.close();
        });
    });

    bindAction('cancel', 'click', function () {
        $.modal.close();
    });

    // *** helper functions ***

    function updateViews(entityName, data) {
        var views = $(data).findByData({ entity: entityName });
        views.each(function () {
            var current = $(this);
            var source = current.parent().html();   // requires view to be the only child
            var viewName = current.parseData('view');
            var id = current.parseData('id');
            var existingViews = $(document)
                .findByData({ entity: entityName, view: viewName, id: id });
            if (existingViews.length != 0) {

                existingViews.replaceWith(source);
            } else {
                var listViews = $(document).findByData({ list: entityName, view: viewName });
                listViews.prepend(source);
            }
        });
    }

    // envokes func when specified action occurs
    function bindAction(actionName, eventName, func) {
        var controls = $(document).findByData({ action: actionName });
        controls.live(eventName, function (event) {
            func.call(this, event);
        });
    }


    // Posts data to /{entity}/{action}{entity} and handles  errors
    function sendRequest(action, entity, data, successCallback) {
        var url = '/' + entity + '/' + action + entity;
        $.post(url, data, function (response) {
            if (data.error) {
                ui.showError(data.error);
            } else {
                successCallback(response);
            }
        }).error(function () {
            alert(data);
            ui.showError('Request failed: ' + action + ' ' + entity);
        });
    }

    function applySelection(view) {
        var isSelected = view.parseData('selected');
        if (isSelected != 'true') {
            toggleSelection(view);
        }
    }

    function removeSelection(view) {
        var isSelected = view.parseData('selected');
        if (isSelected == 'true') {
            toggleSelection(view);
        }
    }

    function toggleSelection(view) {
        var isSelected = view.attr('data-selected');
        var control = view.findByData({ action: 'select' }).first();
        if (isSelected == 'true') {
            control.removeAttr('checked');
            view.removeAttr('data-selected');
        } else {
            control.attr('checked', 'checked');
            view.attr('data-selected', true);
        }
        refreshDeleteControls();
    }

    // disables delete controls if nothing selected, changes selectAll checkbox state
    function refreshDeleteControls() {
        var controls = $(document).findByData({ action: 'delete' });
        controls.each(function () {
            var entityName = $(this).parseData('entity');
            var allViews = $(document).findByData({ view: 'viewRow', entity: entityName });
            var selectedViews = allViews.filterByData({ selected: true });
            var selectAllControls = $(document).findByData({ action: 'selectAll', entity: entityName });
            if (selectedViews.length == 0) {
                $(this).attr("disabled", "disabled");
                selectAllControls.removeAttr('checked');
            } else {
                $(this).removeAttr("disabled");
                if (selectedViews.length == allViews.length) {
                    selectAllControls.attr('checked', 'checked');
                }
            }
        });
    }

    function parseOperation(view) {
        var fields = view.find('input[type="text"]');
        var flags = view.find('input[type="checkbox"]');
        var selected = new Array();
        for (i = 0; i < flags.length; i++) {
            if (flags[i].checked == true) {
                selected.push($(flags[i]).attr('data-id'));
            }
        }
        var data = {
            ID: Number(view.attr('data-id')),
            Date: fields[0].value,
            Amount: fields[1].value,
            Mark: fields[2].value,
            Description: fields[3].value,
            Participants: selected
        }
        return $.param(data, true);
    }

    function parsePerson(view) {
        var fields = view.find('input');
        var data = {
            ID: Number(view.attr('data-id')),
            Name: fields[0].value
        }
        return $.param(data, true);
    }

    function findParentView(node, viewName) {
        var selector;
        if (typeof (viewName) != 'undefined') {
            selector = '[data-view=\"' + viewName + '\"]';
        } else {
            selector = '[data-view]';
        }
        return $(node).parents(selector).first();
    }

})();