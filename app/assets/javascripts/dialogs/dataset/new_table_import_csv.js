chorus.dialogs.NewTableImportCSV = chorus.dialogs.Base.extend({
    constructorName: "NewTableImportCSV",

    templateName: "new_table_import_csv",
    additionalClass: "table_import_csv dialog_wide",
    title: t("dataset.import.table.title"),
    ok: t("dataset.import.table.submit"),
    loadingKey: "dataset.import.importing",
    includeHeader: true,

    delimiter: ',',

    subviews: {
        ".result_table": "importDataGrid"
    },

    events: {
        "click button.submit": "startImport",
        "change #hasHeader": "setHeader",
        "keyup input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "paste input.delimiter[name=custom_delimiter]": "setOtherDelimiter",
        "click input.delimiter[type=radio]": "setDelimiter",
        "click input#delimiter_other": "focusOtherInputField"
    },

    setup: function() {
        this.csvOptions = this.options.csvOptions;
        this.model = this.options.model;
        this.contents = this.csvOptions.contents;

        this.model.set({
            hasHeader: this.csvOptions.hasHeader,
            tableName: chorus.utilities.CsvParser.normalizeForDatabase(this.csvOptions.tableName)
        });

        var csvParser = new chorus.utilities.CsvParser(this.contents, this.model.attributes);
        var columns = csvParser.getColumnOrientedData();
        this.headerColumnNames = _.pluck(columns, "name");
        this.generatedColumnNames = _.map(columns, function(column, i) { return "column_" + (i + 1); });

        this.subscribePageEvent("choice:setType", this.onSelectType);
        this.importDataGrid = new chorus.views.NewTableImportDataGrid();

        this.listenTo(this.model, "saved", this.saved);
        this.listenTo(this.model, "saveFailed", this.saveFailed);
        this.listenTo(this.model, "validationFailed", this.saveFailed);
    },

    postRender: function() {
        var csvParser = new chorus.utilities.CsvParser(this.contents, this.model.attributes);
        var columns = csvParser.getColumnOrientedData();
        var rows = csvParser.rows;
        this.model.serverErrors = csvParser.serverErrors;

        this.model.set({
            types: _.pluck(columns, "type")
        }, {silent: true});

        if (this.model.serverErrors) {
            this.showErrors();
        }

        this.$("input.delimiter").prop("checked", false);
        if (_.contains([",", "\t", ";", " "], this.delimiter)) {
            this.$("input.delimiter[value='" + this.delimiter + "']").prop("checked", true);
        } else {
            this.$("input#delimiter_other").prop("checked", true);
        }

        this.importDataGrid.initializeDataGrid(columns, rows, this.getColumnNames());
    },

    revealed: function() {
        var csvParser = new chorus.utilities.CsvParser(this.contents, this.model.attributes);
        var columns = csvParser.getColumnOrientedData();
        var rows = csvParser.rows;
        this.importDataGrid.initializeDataGrid(columns, rows, this.getColumnNames());
    },

    additionalContext: function() {
        var options = _.clone(this.model.attributes);
        options.columnNameOverrides = this.getColumnNames();
        return {
            includeHeader: this.includeHeader,
            columns: new chorus.utilities.CsvParser(this.contents, options).getColumnOrientedData(),
            delimiter: this.other_delimiter ? this.delimiter : '',
            directions: Handlebars.helpers.unsafeT("dataset.import.table.new.directions", {
                tablename_input_field: "<input type='text' name='tableName' value='" + this.model.get('tableName') + "'/>"
            }),
            ok: this.ok
        };
    },

    saved: function() {
        this.closeModal();
        chorus.toast("dataset.import.started");
        chorus.PageEvents.trigger("csv_import:started");
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
    },

    onSelectType: function(data, linkMenu) {
        var $typeDiv = $(linkMenu.el).closest("div.type");
        $typeDiv.removeClass("integer float text date time timestamp").addClass(data);
    },

    storeColumnInfo: function() {
        this.storeColumnNames();

        var $types = this.$(".slick-headerrow-columns .chosen");
        var types = _.map($types, function($type, i) {
            return $types.eq(i).text();
        });
        this.model.set({types: types}, {silent: true});
    },

    storeColumnNames: function() {
        var $names = this.$(".column_name input:text");

        var columnNames;
        if ($names.length) {
            columnNames = _.map($names, function(name, i) {
                return $names.eq(i).val();
            });

            if (this.model.get("hasHeader")) {
                this.headerColumnNames = columnNames;
            } else {
                this.generatedColumnNames = columnNames;
            }
        }
    },

    getColumnNames: function() {
        return this.model.attributes.hasHeader ? this.headerColumnNames : this.generatedColumnNames;
    },

    startImport: function() {
        if (this.performValidation()) {
            this.storeColumnInfo();
            this.updateModel();

            this.$("button.submit").startLoading(this.loadingKey);
            this.model.save();
        }

        if (this.model.serverErrors) {
            this.showErrors();
        }
    },

    performValidation: function() {
        var $names = this.$(".column_name input:text");
        var pattern = chorus.ValidationRegexes.ChorusIdentifier64();
        var allValid = true;

        var $tableName = this.$(".directions input:text");

        this.clearErrors();

        if(!$tableName.val().match(pattern)) {
            allValid = false;
            this.markInputAsInvalid($tableName, t("import.validation.toTable.required"), true);
        }

        _.each($names, function(name, i) {
            var $name = $names.eq(i);
            if (!$name.val().match(pattern)) {
                allValid = false;
                this.markInputAsInvalid($name, t("import.validation.column_name"), true);
            }
        }, this);

        return allValid;
    },

    updateModel: function() {
        var newTableName = chorus.utilities.CsvParser.normalizeForDatabase(this.$(".directions input:text").val());
        this.model.set({
            hasHeader: !!(this.$("#hasHeader").prop("checked")),
            delimiter: this.delimiter,
            tableName: newTableName,
            toTable: newTableName,
            columnNames: this.getColumnNames()
        });
    },

    setHeader: function() {
        this.storeColumnInfo();
        this.updateModel();

        this.render();
    },

    focusOtherInputField: function(e) {
        this.$("input[name=custom_delimiter]").focus();
    },

    setDelimiter: function(e) {
        if (e.target.value === "other") {
            this.delimiter = this.$("input[name=custom_delimiter]").val();
            this.other_delimiter = true;
        } else {
            this.delimiter = e.target.value;
            this.other_delimiter = false;
        }
        this.updateModel();
    },

    setOtherDelimiter: function() {
        this.$("input.delimiter[type=radio]").prop("checked", false);
        var otherRadio = this.$("input#delimiter_other");
        otherRadio.prop("checked", true);
        otherRadio.click();
    }
});
