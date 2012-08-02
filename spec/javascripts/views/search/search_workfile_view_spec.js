describe("chorus.views.SearchWorkfile", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult({workfiles: {results: [
            {
                id: "1",
                workspace: {id: "2", name: "Test"},
                fileName: "analysis.sql",
                fileType: "sql",
                latestVersionId: 1,
                comments: [
                    {highlightedAttributes: { "body": "nice <em>cool<\/em> file"   }, "body": "nice cool file", "lastUpdatedStamp": "2012-02-28 14:07:34", "isPublished": false, "id": "10000", "workspaceId": "10000", "isComment": false, "isInsight": false, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                    {highlightedAttributes: { "body": "nice <em>cool<\/em> comment"}, "body": "nice cool comment", "lastUpdatedStamp": "2012-02-28 14:07:46", "isPublished": false, "id": "10001", "workspaceId": "10000", "isComment": true, "isInsight": false, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                    {highlightedAttributes: { "body": "Nice <em>cool<\/em> insight"}, "body": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10002", "workspaceId": "10000", "isComment": false, "isInsight": true, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}},
                    {highlightedAttributes: { "body": "Nice <em>cool<\/em> insight"}, "body": "Nice cool insight", "lastUpdatedStamp": "2012-02-28 14:09:56", "isPublished": false, "id": "10003", "workspaceId": "10000", "isComment": false, "isInsight": true, "owner": {"id": "InitialUser", "lastName": "Admin", "firstName": "EDC"}}
                ],
                versionInfo: {
                    lastUpdatedStamp: "2012-04-02 14:56:19.34",
                    modifiedBy: {id:"InitialUser", lastName:"Admin", firstName:"EDC"},
                    versionFileId: "1333403779156_199",
                    id: 1,
                    versionOwner: "edcadmin"
                }
            }
        ]}});

        this.model = this.result.workfiles().models[0];
        this.model.set({highlightedAttributes: {fileName : "<em>cool</em> file"}});
        this.view = new chorus.views.SearchWorkfile({model: this.model});
        this.view.render()
    });

    it("includes the correct workspace file icon", function() {
        expect(this.view.$("img.icon").attr("src")).toBe("/images/workfiles/large/sql.png");
    });

    it("has a link to the workfile for each workfile in the collection", function() {
        expect(this.view.$('a.name').attr('href')).toBe("#/workspaces/2/workfiles/1");
    });

    it("shows which workspace each result was found in", function() {
        expect(this.view.$('.location')).toContainTranslation(
            "workspaces_used_in.body.one",
            {workspaceLink: "Test"}
        )
    })

    it("shows matching description if any", function() {
        expect(this.view.$(".description .description_content")).toBeEmpty();
    });

    it("shows matching name", function() {
        expect(this.view.$(".name").html()).toContain("<em>cool</em> file");
    });

    describe("thumbnails", function() {
        it("uses the icon url", function() {
            this.view.render();
            expect(this.view.$("img")).toHaveAttr("src", this.model.iconUrl());
        });
    });

    describe("shows version commit messages in the comments area", function() {
        beforeEach(function() {
            this.view.model.set({
                highlightedAttributes: {
                    commitMessage: [
                        "this is a <em>cool</em> version",
                        "this is a <em>cooler</em> version"
                    ]}
            });
            this.view.render();
        });

        it("looks correct", function() {
            expect(this.view.$('.more_comments .comment:eq(2) .comment_type').text().trim()).toBe('');
            expect(this.view.$('.more_comments .comment:eq(2) .comment_content').html()).toContain("this is a <em>cooler</em> version");
        });
    });
});
