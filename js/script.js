"use strict";

$(function () {
    const MAP_BACKGROUND_COLOUR = "#f0f0f0";
    const INACTIVE_MAP_COLOUR = "#555555";
    const ACTIVE_MAP_COLOURS = [
        "#00C4F0",
        "#00BCE5",
        "#00B3DB",
        "#00ABD1",
        "#00A3C7"
    ];
    const ALT_TEXTS = {
        FLAG: "National flag of {0}",
        POSTER: "Film poster for {0}"
    };
    const URLS = {
        FLAG: "https://flagpedia.net/data/flags/vector/{0}.svg",
        IMDB: "https://www.imdb.com/title/{0}/",
        JUST_WATCH: "https://www.justwatch.com/uk/movie/{0}",
        LETTERBOXD: "https://letterboxd.com/film/{0}/",
        ROTTEN_TOMATOES: "https://www.rottentomatoes.com/m/{0}",
        WIKIPEDIA: "https://en.wikipedia.org/wiki/{0}",
        YOUTUBE: "https://www.youtube.com/watch?v={0}"
    };

    let _map;
    let _films = {};
    let _filmsArraySorted = [];

    initialiseEventHandlers();

    loadData(function () {
        initialiseCount();
        initialiseMap();
        initialiseList();
    });

    //-----------------------------------------------------------

    function initialiseEventHandlers() {
        $("a").prop("target", "_blank");

        $("#btnShowMap").click(function () {
            showMap();
        });

        $("#btnShowList").click(function () {
            showList();
        });

        $('#filmCountryFlag').on({
            "error": function () {
                $(this).hide();
            },
            "load": function () {
                $(this).show();
            }
        });
    }

    function loadData(onLoaded) {
        _filmsArraySorted = [];
        _films = {};

        $.getJSON("data/films.json", function (filmsArray) {
            for (let i = 0; i < filmsArray.length; i++) {
                let film = filmsArray[i];
                film.colour = getRandomActiveMapColour();
                _films[film.countryCode] = film;
            }
            _filmsArraySorted = filmsArray.sort(function (a, b) {
                return (a.country < b.country) ? -1 :
                    (a.country > b.country) ? 1 : 0;
            });

            onLoaded();
        });
    }

    function initialiseMap() {
        _map = new jvm.Map({
            map: "world_merc",
            container: $("#map"),
            backgroundColor: MAP_BACKGROUND_COLOUR,
            zoomMin: 0.9,
            focusOn: {
                x: 0.5,
                y: 0.5,
                scale: 0.95
            },
            series: {
                regions: [{
                    attribute: "fill"
                }]
            },
            onRegionClick: function (_, countryCode) {
                showFilmDetails(countryCode);
            }
        });

        // Set map colours
        _map.series.regions[0].setValues(getMapColours());
    }

    function uninitialiseMap() {
        _map.remove();
        _map = undefined;
    }

    function initialiseList() {
        $("#list").empty();

        for (let i = 0; i < _filmsArraySorted.length; i++) {
            let film = _filmsArraySorted[i];
            $("#list").append(
                $("<span></span>")
                    .addClass("listFilm")
                    .prop({
                        title: "{0} ({1})".format(film.title, film.year),
                        style: "background-color: {0}".format(film.colour)
                    })
                    .text(film.country)
                    .click(function(){
                        showFilmDetails(film.countryCode);
                    }));
        }
    }

    function initialiseCount() {
        animateWithDeceleration(1, _filmsArraySorted.length,
            function (val) {
                $("#filmCount").text(val);
            },
            function () {
                $("#filmCount").addClass("done");
            });
    }

    function animateWithDeceleration(min, max, tickCallback, doneCallback) {
        let delayMs = 20;
        let fn = function (val) {
            tickCallback(val);
            if (val < max) {
                delayMs *= (val < (max - 10)) ? 1 : 1.3;
                setTimeout(function () {
                    fn(val + 1)
                }, delayMs);
            } else {
                doneCallback();
            }
        };
        fn(min);
    }

    function showMap() {
        $("#btnShowMap").addClass("selected");
        $("#mapContainer").show();
        initialiseMap();

        $("#btnShowList").removeClass("selected");
        $("#listContainer").hide();
    }

    function showList() {
        $("#btnShowList").addClass("selected");
        $("#listContainer").show();

        uninitialiseMap();
        $("#btnShowMap").removeClass("selected");
        $("#mapContainer").hide();
    }

    function getMapColours() {
        let colours = {};
        for (let region in _map.regions) {
            colours[region] = _films[region]
                ? _films[region].colour
                : INACTIVE_MAP_COLOUR;
        }
        return colours;
    }

    function getRandomActiveMapColour() {
        let index = Math.floor(Math.random() * ACTIVE_MAP_COLOURS.length);
        return ACTIVE_MAP_COLOURS[index];
    }

    function showFilmDetails(countryCode) {
        let film = _films[countryCode];

        if (!film) {
            return;
        }

        $("#filmCountry").text(film.country);
        $("#filmTitle").text(film.title);
        $("#filmYear").text(film.year);
        $("#filmCountryFlag")
            .prop({
                src: URLS.FLAG.format(film.countryCode.toLowerCase()),
                alt: ALT_TEXTS.FLAG.format(film.country)
            });

        $("#filmImageContainer")
            .toggleClass("defaultImage", !film.image);
        $("#filmImage")
            .prop({
                src: film.image,
                alt: ALT_TEXTS.POSTER.format(film.title)
            })
            .toggle(!!film.image);

        $("#filmOriginalTitle")
            .text(film.originalTitle)
            .toggle(!!film.originalTitle);

        $("#imdbLink")
            .prop({
                href: URLS.IMDB.format(film.imdb)
            })
            .toggle(!!film.imdb);

        $("#letterboxdLink")
            .prop({
                href: URLS.LETTERBOXD.format(film.letterboxd)
            })
            .toggle(!!film.letterboxd);

        $("#rottenTomatoesLink")
            .prop({
                href: URLS.ROTTEN_TOMATOES.format(film.rottenTomatoes)
            })
            .toggle(!!film.rottenTomatoes);

        $("#wikipediaLink")
            .prop({
                href: URLS.WIKIPEDIA.format(film.wikipedia)
            })
            .toggle(!!film.wikipedia);

        $("#justwatchLink")
            .prop({
                href: URLS.JUST_WATCH.format(film.justwatch)
            })
            .toggle(!!film.justwatch);

        $("#trailerLink")
            .prop({
                href: URLS.YOUTUBE.format(film.trailer)
            })
            .toggle(!!film.trailer);

        $("#reviewLink")
            .prop({
                href: URLS.YOUTUBE.format(film.review)
            })
            .toggle(!!film.review);

        $("#filmReviewer")
            .text(film.reviewer);

        $("#filmDetailsModal").modal();
    }

    String.prototype.format = function () {
        let formatted = this;
        for (let i = 0; i < arguments.length; i++) {
            formatted = formatted.replace("{" + i + "}", arguments[i]);
        }
        return formatted;
    }
});