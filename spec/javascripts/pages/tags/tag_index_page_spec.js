describe("chorus.pages.TagIndexPage", function() {
    beforeEach(function() {
        spyOn(chorus.pages.TagIndexPage.prototype, "render").andCallThrough();
        this.page = new chorus.pages.TagIndexPage();
        this.tagSet = new chorus.collections.TagSet();
    });

    describe("breadcrumbs", function() {
        beforeEach(function() {
            this.page.render();
        });

        it("displays the Tags breadcrumb", function() {
            expect(this.page.$('.breadcrumbs')).toContainTranslation("breadcrumbs.home");
            expect(this.page.$('.breadcrumbs')).toContainTranslation("breadcrumbs.tags");
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.page.render();
        });

        it('displays the page title', function() {
            expect(this.page.$('h1[title=Tags]')).toContainTranslation("tags.title_plural");
        });
    });

    describe("when the tags have loaded", function() {
        beforeEach(function() {
            this.fetchedTags = [{ name: "IamTag"}, { name: "IamAlsoTag" }];
            this.server.completeFetchAllFor(this.tagSet, this.fetchedTags);
        });

        it("displays the tags", function() {
            _.each(this.fetchedTags, function(tag) {
                expect(this.page.$('.content')).toContainText(tag.name);
            }, this);
        });

        it("loads the correct count", function() {
            expect(this.page.$('.count')).toContainText(this.fetchedTags.length);
        });

        describe("sidebar", function() {
            it("selects the first tag and shows it on the sidebar", function() {
                expect(this.page.$('.tag_title')).toContainText("IamTag");
            });
        });
    });

    describe("when a tag has been destroyed", function() {
        beforeEach(function() {
            this.fetchedTags = [{ name: "IamTag"}, { name: "IamAlsoTag" }];
            this.server.completeFetchAllFor(this.tagSet, this.fetchedTags);
        });

        it("renders the page", function() {
            var renderCallCount = this.page.render.calls.length;
            this.page.mainContent.collection.models[0].destroy();
            expect(this.page.render.calls.length).toBe(renderCallCount + 1);
        });
    });
});