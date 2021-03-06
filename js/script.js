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
    const ALT_TEXT_FLAG = "National flag of {0}";
    const ALT_TEXT_POSTER = "Film poster for {0}";
    const URL_FLAG = "https://flagcdn.com/{0}.svg";
    const URL_IMDB = "https://www.imdb.com/title/{0}/";
    const URL_JUST_WATCH = "https://www.justwatch.com/uk/movie/{0}";
    const URL_LETTERBOXD = "https://letterboxd.com/film/{0}/";
    const URL_ROTTEN_TOMATOES = "https://www.rottentomatoes.com/m/{0}";
    const URL_WIKIPEDIA = "https://en.wikipedia.org/wiki/{0}";
    const URL_YOUTUBE = "https://www.youtube.com/watch?v={0}";

    let _map;
    let _films = {};
    let _filmsSortedByCountry = [];
    let _filmsSortedByTitle = [];

    initialiseEventHandlers();

    loadData(function () {
        initialiseCount();
        initialiseMap();
        initialiseCountriesList();
        initialiseFilmsList();
    });

    //-----------------------------------------------------------

    function initialiseEventHandlers() {
        $("a").prop("target", "_blank");

        $("#btnShowMap").click(function () {
            showMap();
        });
        $("#btnShowListCountries").click(function () {
            showListCountries();
        });
        $("#btnShowListFilms").click(function () {
            showListFilms();
        });
        $("#btnShowAbout").click(function () {
            showAbout();
        });

        $('#filmCountryFlag').on({
            error: function () {
                $(this).hide();
            },
            load: function () {
                $(this).show();
            }
        });
    }

    function loadData(onLoaded) {
        _filmsSortedByCountry = [];
        _filmsSortedByTitle = [];
        _films = {};

        $.getJSON("data/films.json", function (filmsArray) {
            filmsArray.forEach(function (film) {
                film.colour = getRandomActiveMapColour();
                _films[film.countryCode] = film;
            });
            _filmsSortedByCountry = filmsArray.sort(function (a, b) {
                return (a.country < b.country) ? -1 :
                    (a.country > b.country) ? 1 : 0;
            });
            _filmsSortedByTitle = filmsArray.slice().sort(function (a, b) {
                let aTitle = a.title.sortable();
                let bTitle = b.title.sortable();
                return (aTitle < bTitle) ? -1 :
                    (aTitle > bTitle) ? 1 : 0;
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
            },
            onRegionTipShow: function (_, tip, code) {
                let film = _films[code];
                if (film) {
                    tip.text("{0}: {1} ({2})".format(film.country, film.title, film.year));
                }
            }
        });

        // Set map colours
        _map.series.regions[0].setValues(getMapColours());
    }

    function uninitialiseMap() {
        if (_map) {
            _map.remove();
            _map = undefined;
        }
    }

    function initialiseCountriesList() {
        initialiseList(
            "#listCountries",
            _filmsSortedByCountry,
            function (film) {
                return film.country;
            },
            function (film) {
                return "{0} ({1})".format(film.title, film.year);
            });
    }

    function initialiseFilmsList() {
        initialiseList(
            "#listFilms",
            _filmsSortedByTitle,
            function (film) {
                return "{0} ({1})".format(film.title, film.year);
            },
            function (film) {
                return film.country;
            });
    }

    function initialiseList(elementId, array, textFunction, tipFunction) {
        $(elementId).empty();

        array.forEach(function (film) {
            $("<span></span>")
                .addClass("listFilm")
                .prop({
                    title: tipFunction(film),
                    style: "background-color: {0}".format(film.colour)
                })
                .text(textFunction(film))
                .click(function () {
                    showFilmDetails(film.countryCode);
                })
                .prepend(
                    $("<img/>").prop({
                        src: URL_FLAG.format(film.countryCode.toLowerCase()),
                        alt: ALT_TEXT_FLAG.format(film.country)
                    })
                )
                .appendTo(elementId);
        });
    }

    function initialiseCount() {
        $("#filmCount").text(_filmsSortedByCountry.length);
    }

    function showMap() {
        selectButton("#btnShowMap");
        selectSection("#sectionMap");
        initialiseMap();
    }

    function showListCountries() {
        selectButton("#btnShowListCountries");
        selectSection("#sectionListCountries");
        uninitialiseMap();
    }

    function showListFilms() {
        selectButton("#btnShowListFilms");
        selectSection("#sectionListFilms");
        uninitialiseMap();
    }

    function showAbout() {
        selectButton("#btnShowAbout");
        selectSection("#sectionAbout")
        uninitialiseMap();
    }

    function selectButton(selector) {
        $(selector)
            .addClass("selected")
            .siblings()
            .removeClass("selected");
    }

    function selectSection(selector) {
        $(selector)
            .show()
            .siblings()
            .hide();
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
                src: URL_FLAG.format(film.countryCode.toLowerCase()),
                alt: ALT_TEXT_FLAG.format(film.country)
            });

        $("#filmImageContainer")
            .toggleClass("defaultImage", !film.image);
        $("#filmImage")
            .prop({
                src: film.image,
                alt: ALT_TEXT_POSTER.format(film.title)
            })
            .toggle(!!film.image);

        $("#filmOriginalTitle")
            .text(film.originalTitle)
            .toggle(!!film.originalTitle);

        setupButton("#imdbLink", URL_IMDB, film.imdb);
        setupButton("#letterboxdLink", URL_LETTERBOXD, film.letterboxd);
        setupButton("#rottenTomatoesLink", URL_ROTTEN_TOMATOES, film.rottenTomatoes);
        setupButton("#wikipediaLink", URL_WIKIPEDIA, film.wikipedia);
        setupButton("#justwatchLink", URL_JUST_WATCH, film.justwatch);
        setupButton("#trailerLink", URL_YOUTUBE, film.trailer);
        setupButton("#reviewLink", URL_YOUTUBE, film.review);

        $("#filmReviewer")
            .text(film.reviewer);

        $("#filmDetailsModal").modal();
    }

    function setupButton(selector, url, value) {
        $(selector)
            .prop({
                href: url.format(value)
            })
            .toggle(!!value);
    }

    String.prototype.format = function () {
        let formatted = this;
        for (let i = 0; i < arguments.length; i++) {
            formatted = formatted.replace("{" + i + "}", arguments[i]);
        }
        return formatted;
    }

    String.prototype.sortable = function () {
        return this.replace(/^(A|The) /, "");
    }
});
