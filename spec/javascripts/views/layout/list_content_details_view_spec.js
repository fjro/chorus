describe("chorus.views.ListContentDetails", function() {
    beforeEach(function() {
        this.collection = fixtures.userSet();
        this.collection.pagination = {
            "total": "2",
            "page": "1",
            "records": "22"
        }
        this.collection.loaded = true;
        this.view = new chorus.views.ListContentDetails({ collection: this.collection, modelClass: "User" });
    })

    describe("#render", function() {
        describe("buttons", function() {
            context("with a view", function() {
                beforeEach(function() {
                    this.view.options.buttons = [
                        {
                            view: "WorkspacesNew",
                            text: "Create a Workspace",
                            dataAttributes: [
                                {
                                    name: "foo",
                                    value: "bar"
                                }
                            ]
                        },
                        {
                            url: "#/foo",
                            text: "Create a Foo"
                        }
                    ];

                    this.view.render();
                });

                it("shows the buttons", function() {
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]')).toExist();
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]').text()).toBe("Create a Workspace");
                    expect(this.view.$('button[data-dialog="WorkspacesNew"]')).toHaveData("foo", "bar");

                    expect(this.view.$("a.button[href=#/foo]")).toExist();
                    expect(this.view.$("a.button[href=#/foo]")).toContainText("Create a Foo");
                });
            });
        });

        context("when the collection is loaded", function() {
            context("and the hideCounts option is falsy", function() {
                beforeEach(function() {
                    this.view.options.hideCounts = false;
                    this.view.render();
                })

                it("renders the total number of items in the collection", function() {
                    expect(this.view.$(".count")).toContainText("22");
                })
            })

            context("and the hideCounts option is truthy", function() {
                beforeEach(function() {
                    this.view.options.hideCounts = true;
                    this.view.render();
                })

                it("does not render the total number of items in the collection", function() {
                    expect(this.view.$(".count")).not.toExist();
                })

                it("does not render the current page or total page count", function() {
                    expect(this.view.$(".pagination .page")).not.toExist();
                })
            });

            context("and there is only one page of items", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "1";
                    this.view.render();
                })

                it("does not display the pagination controls", function() {
                    expect(this.view.$(".pagination")).toHaveClass("hidden");
                })

                context("and the hideIfNoPagination option is falsy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = false;
                        this.view.render();
                    })

                    it("does not add the hidden class to the container", function() {
                        expect($(this.view.el)).not.toHaveClass("hidden")
                    })
                })

                context("and the hideIfNoPagination option is truthy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = true;
                        this.view.render();
                    })

                    it("adds the hidden class to the container", function() {
                        expect($(this.view.el)).toHaveClass("hidden")
                    })
                })
            })

            context("and there is more than one page of items", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "2";
                    this.view.render();
                })

                it("displays the pagination controls", function() {
                    expect(this.view.$(".pagination")).not.toHaveClass("hidden");
                })

                it("displays the page number of the collection", function() {
                    expect(this.view.$(".pagination .page .current").text().trim()).toBe(this.collection.pagination.page);
                });

                it("displays the total number of pages in the collection", function() {
                    expect(this.view.$(".pagination .page .total").text().trim()).toBe(this.collection.pagination.total);
                });

                it("does not add the hidden class to the container", function() {
                    expect($(this.view.el)).not.toHaveClass("hidden")
                })

                context("when there is a next page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "1";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    })

                    it("renders the next page link", function() {
                        expect(this.view.$(".pagination .links a.next")).not.toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.next")).toHaveClass("hidden");
                    })
                });

                context("when there is NO next page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    })

                    it("renders the next page link, but not as a link", function() {
                        expect(this.view.$(".pagination .links a.next")).toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.next")).not.toHaveClass("hidden");
                    });
                });

                context("when there is a previous page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    })

                    it("renders the previous page link", function() {
                        expect(this.view.$(".pagination .links a.previous")).not.toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.previous")).toHaveClass("hidden");
                    })
                })

                context("when there is NO previous page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "1";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    })

                    it("renders the previous page link, but not as a link", function() {
                        expect(this.view.$(".pagination .links a.previous")).toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.previous")).not.toHaveClass("hidden");
                    });
                })
            });

            context("and the collection is empty", function() {
                beforeEach(function() {
                    this.view.collection = new chorus.collections.UserSet();
                    this.view.collection.loaded = true;
                    this.view.render();
                })

                it("does not display the pagination controls", function() {
                    expect(this.view.$(".pagination")).toHaveClass("hidden");
                })

                context("and the hideIfNoPagination option is falsy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = false;
                        this.view.render();
                    })

                    it("does not add the hidden class to the container", function() {
                        expect($(this.view.el)).not.toHaveClass("hidden")
                    })
                })

                context("and the hideIfNoPagination option is truthy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = true;
                        this.view.render();
                    })

                    it("adds the hidden class to the container", function() {
                        expect($(this.view.el)).toHaveClass("hidden")
                    })
                })
            })
        })

        context("when the collection is not loaded", function() {
            beforeEach(function() {
                this.collection.loaded = undefined;
                this.view.render();
            })

            it("displays 'loading'", function() {
                expect(this.view.$(".loading")).toExist();
            })
        })
    });

    describe("clicking the pagination links", function() {
        beforeEach(function() {
            this.collection.pagination.page = "2";
            this.collection.pagination.total = "3";
            spyOn(window, 'scroll');
            this.view.render();
        })

        describe("when the 'next' link is clicked", function() {
            beforeEach(function() {
                spyOn(this.collection, "fetchPage");
                this.view.$("a.next").click();
            });

            it("fetches the next page of the collection", function() {
                expect(this.collection.fetchPage).toHaveBeenCalledWith(3);
            })

            it("scrolls the viewport to the top of the page", function() {
                expect(window.scroll).toHaveBeenCalledWith(0, 0)
            })
        })

        describe("when the 'previous' link is clicked", function() {
            beforeEach(function() {
                spyOn(this.collection, "fetchPage");
                this.view.$("a.previous").click();
            });

            it("fetches the previous page of the collection", function() {
                expect(this.collection.fetchPage).toHaveBeenCalledWith(1);
            })

            it("scrolls the viewport to the top of the page", function() {
                expect(window.scroll).toHaveBeenCalledWith(0, 0);
            })
        })
    })

    describe("type ahead search", function() {
        beforeEach(function() {
            spyOnEvent(this.view, "search:content");
            this.view.options.search = t("dataset.search");
            this.view.render();
        });

        it("renders the search field in the page", function() {
            expect(this.view.$("input.search")).toExist();
            expect(this.view.$("input.search").attr("placeholder")).toContainText(t("dataset.search"));
        });

        it("triggers search:content with the search text on change event", function() {
            this.view.$("input.search").val("foo").change();
            expect("search:content").toHaveBeenTriggeredOn(this.view, ["foo"]);
        });

        it("triggers search:content with the search text on keyup event", function() {
            this.view.$("input.search").val("bar").keyup();
            expect("search:content").toHaveBeenTriggeredOn(this.view, ["bar"]);
        });

        it("triggers search:content with the search text on paste event", function() {
            this.view.$("input.search").val("sna").trigger("paste");
            expect("search:content").toHaveBeenTriggeredOn(this.view, ["sna"]);
        });

        it("does not show the clear icon", function() {
            expect(this.view.$(".chorus_search_clear")).toHaveClass("hidden");
        });

        describe("there is text entered in the search field", function() {
            beforeEach(function() {
                this.view.$("input.search").val("a search term").change();
            });

            it("shows the clear icon", function() {
                expect(this.view.$(".chorus_search_clear")).not.toHaveClass("hidden");
            });

            context("when the clear input icon is clicked", function() {
                beforeEach(function() {
                    this.view.$(".chorus_search_clear").click();
                });

                it("clears the text from the input field", function() {
                    expect(this.view.$("input.search").val()).toBe("");
                });

                it("does not show the clear icon", function() {
                    expect(this.view.$(".chorus_search_clear")).toHaveClass("hidden");
                });

                it("triggers search:content with the search text on keyup event", function() {
                    expect("search:content").toHaveBeenTriggeredOn(this.view, [""]);
                });
            });
        });
    });
});
