
jQuery(function($) {
  'use strict';

  var Templates = {
    tags: function(data) {
      var template = $('<tr><th>' + data.title + '</th><td>' + (new Date(data.time)).toLocaleString() + '</td>' +
        '<td>' + data.description + '</td>');

      return template;
    }
  };

  var App = {
    init: function() {
      this.cacheElements();
      this.bindEvents();
      this.setupElements();
      this.processChildren();
    },

    cacheElements: function() {
      this.$document = $(document);
      this.$window   = $(window);
      this.$main     = $('#main');
      this.$loading  = $('#loading');
    },

    bindEvents: function() {
      this.$document.on('pjax:start', this.pjaxStart);
      this.$document.on('pjax:end', this.pjaxEnd);
      // this.$window.resize(this.windowResize);
    },

    // windowResize: function() {
    //   if (App.meetings.view.waveform) {
    //     App.meetings.view.updateWaveform();
    //   }
    // },

    setupElements: function() {
      this.$document.pjax('a:not([data-refresh])', this.$main);
    },

    processChildren: function() {
      var location = window.location.pathname;
      $('[data-toggle=tooltip]').tooltip()
      console.log(location);
      if (/meetings\/new/.test(location)) {
        this.meetings.new.init();
      } else if (/meetings/.test(location)) {
        this.meetings.view.init();
      } else if (/settings/.test(location)) {
        this.settings.init();
      }
    },

    pjaxStart: function() {
      App.$loading.show();
    },

    pjaxEnd: function() {
      App.processChildren();
      App.$loading.hide();
    }
  };

  App.settings = {
    init: function() {
      this.cacheElements();
      this.setupElements();
    },

    cacheElements: function() {
      this.$skillsField = $('#skills');
    },

    setupElements: function() {
      this.$skillsField.tagit({
        fieldName: 'skills',
        placeholderText: 'My Skills?'
      });
    }
  };

  App.meetings = {};

  App.meetings.new = {
    init: function() {
      this.cacheElements();
      this.setupElements();
      this.returnedUsers = [];
    },

    cacheElements: function() {
      this.$invitedField = $('#invited');
      this.$startDateField    = $('#start-date');
      this.$endDateField = $('#end-date');
    },

    setupElements: function() {
      this.$invitedField.tagit({
        fieldName: 'invited',
        placeholderText: 'Who to invite?',
        autocomplete: {
          source: this.getUsers
        },
        beforeTagAdded: this.beforeTagAdded
      });

      this.$startDateField.datetimepicker();
      this.$endDateField.datetimepicker();
    },

    beforeTagAdded: function(event, ui) {

      if ($.inArray(ui.tagLabel, App.meetings.new.returnedUsers) == -1) {
        return false;
      }
    },

    getUsers: function(req, res) {
      App.meetings.new.returnedUsers = [];
      $.ajax({
        url: '/users/lookup?q=' + encodeURIComponent(req.term),
        success: function(data) {
          App.meetings.new.returnedUsers = data;
          res($.map(data, function(item) {
            return {
              label: item,
              value: item
            };
          }));
        },
        error: function(xhr, status, error) {
          App.meetings.new.returnedUsers = [];
        }
      });
    }
  };

  App.meetings.view = {
    init: function() {
      this.meetingId = window.location.pathname.split("/").pop();
      this.socket = io.connect('/?meeting=' + this.meetingId, {
        port: 8080
      });
      this.data = [];
      this.tagTime = Date.now();
      this.cacheElements();
      this.setupElements();
    },

    cacheElements: function() {
      this.$waveform = $('#waveform');
      this.$tagLink  = $('.tag-link');
      this.$tagAdd   = $('.tag-add');
      this.$tagModal = $('#tag-meeting');
      this.$noTags   = $('.tag-list .empty');
      this.$tagList  = $('.tag-list');
    },

    handleNewTag: function() {
      App.meetings.view.tagTime = Date.now();
    },

    processTag: function() {
      var tag = $('#tag');
      var desc = $('#description');
      App.meetings.view.socket.emit('tag add', {
        title: tag.val(),
        description: desc.val(),
        time: App.meetings.view.tagTime
      });
      App.meetings.view.$tagModal.modal('hide');
    },

    tagServerAdd: function(data) {
      console.log('well, were here');
      var newTemplate = Templates.tags(data);
      console.log(newTemplate);
      console.log(App.meetings.view.$tagList);
      App.meetings.view.$noTags.hide();
      App.meetings.view.$tagList.append(newTemplate);
    },

    setupElements: function() {
      this.$tagLink.on('click', this.handleNewTag);
      this.$tagAdd.on('click', this.processTag);
      this.socket.on('tag add', this.tagServerAdd);
      if (this.$waveform.length) {
        for (var i = 0; i < 500; i++) {
          this.data.push(Math.random());
        }

        this.waveform = new Waveform({
          container: this.$waveform[0],
          data: this.data,
          innerColor: '#333'
        });
      }
    },

    // updateWaveform: function() {
    //   this.waveform.update({
    //     container: this.$waveform[0],
    //     data: this.data,
    //     innerColor: '#333'
    //   });
    // }
  };

  App.init();
});