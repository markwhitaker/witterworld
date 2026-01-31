"use strict";

$(function () {
    const MAP_BACKGROUND_COLOUR = "#F0F0F0";
    const INACTIVE_MAP_COLOUR = "#555555";
    const ACTIVE_MAP_COLOURS = [
        "#00C4F0",
        "#00BCE5",
        "#00B3DB",
        "#00ABD1",
        "#00A3C7"
    ];


    let _map;
    let _films = {};
    let _filmsSortedByCountry = [];
    let _filmsSortedByTitle = [];

    initialiseEventHandlers();

    loadData(() => {
        initialiseCount();
        initialiseMap();
        initialiseCountriesList();
        initialiseFilmsList();
    });

    //-----------------------------------------------------------

    function initialiseEventHandlers() {
        $("a").prop("target", "_blank");

        $("#btnShowMap").click(() => showMap());
        $("#btnShowListCountries").click(() => showListCountries());
        $("#btnShowListFilms").click(() => showListFilms());
        $("#btnShowAbout").click(() => showAbout());

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

        $.getJSON("data/films.json", filmsArray => {
            filmsArray.forEach(film => {
                film.colour = getRandomActiveMapColour();
                _films[film.countryCode] = film;
            });
            _filmsSortedByCountry = filmsArray.sort((a, b) =>
                (a.country < b.country) ? -1 : (a.country > b.country) ? 1 : 0);
            _filmsSortedByTitle = filmsArray.slice().sort((a, b) => {
                const aTitle = a.title.sortable();
                const bTitle = b.title.sortable();
                return (aTitle < bTitle) ? -1 : (aTitle > bTitle) ? 1 : 0;
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
            onRegionClick: (_, countryCode) => showFilmDetails(countryCode),
            onRegionTipShow: (_, tip, code) => {
                const film = _films[code];
                if (film) {
                    tip.text(`${film.country}: ${film.title} (${film.year})`);
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
            film => film.country,
            film => `${film.title} (${film.year})`);
    }

    function initialiseFilmsList() {
        initialiseList(
            "#listFilms",
            _filmsSortedByTitle,
            film => `${film.title} (${film.year})`,
            film => film.country);
    }

    function initialiseList(elementId, array, textFunction, tipFunction) {
        $(elementId).empty();

        array.forEach(film => {
            $("<span></span>")
                .addClass("listFilm")
                .prop({
                    title: tipFunction(film),
                    style: `background-color: ${film.colour}`
                })
                .text(textFunction(film))
                .click(() => showFilmDetails(film.countryCode))
                .prepend(
                    $("<img/>").prop({
                        src: flagUrl(film),
                        alt: flagAltText(film)
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
        const colours = {};
        for (const region in _map.regions) {
            colours[region] = _films[region]
                ? _films[region].colour
                : INACTIVE_MAP_COLOUR;
        }
        return colours;
    }

    function getRandomActiveMapColour() {
        const index = Math.floor(Math.random() * ACTIVE_MAP_COLOURS.length);
        return ACTIVE_MAP_COLOURS[index];
    }

    function showFilmDetails(countryCode) {
        const film = _films[countryCode];

        if (!film) {
            return;
        }

        $("#filmCountry").text(film.country);
        $("#filmTitle").text(film.title);
        $("#filmYear").text(film.year);
        $("#filmCountryFlag")
            .prop({
                src: flagUrl(film),
                alt: flagAltText(film)
            });

        $("#filmImageContainer")
            .toggleClass("defaultImage", !film.image);
        $("#filmImage")
            .prop({
                src: film.image,
                alt: `Film poster for ${film.title} (${film.year})`
            })
            .toggle(!!film.image);

        $("#filmOriginalTitle")
            .text(film.originalTitle)
            .toggle(!!film.originalTitle);

        $("#imdbLink").toggle(!!film.imdb).prop({href: `https://www.imdb.com/title/${film.imdb}/`});
        $("#letterboxdLink").toggle(!!film.letterboxd).prop({href: `https://letterboxd.com/film/${film.letterboxd}/`});
        $("#rottenTomatoesLink").toggle(!!film.rottenTomatoes).prop({href: `https://www.rottentomatoes.com/m/${film.rottenTomatoes}`});
        $("#wikipediaLink").toggle(!!film.wikipedia).prop({href: `https://en.wikipedia.org/wiki/${film.wikipedia}`});
        $("#justwatchLink").toggle(!!film.justwatch).prop({href: `https://www.justwatch.com/uk/movie/${film.justwatch}`});
        $("#trailerLink").toggle(!!film.trailer).prop({href: `https://youtu.be/${film.trailer}`});
        $("#reviewLink").toggle(!!film.review).prop({href: `https://youtu.be/${film.review}`});
        $("#filmReviewer").text(film.reviewer);
        $("#filmDetailsModal").modal();
    }

    function flagUrl(film) {
        return `https://flagcdn.com/${film.countryCode.toLowerCase()}.svg`;
    }

    function flagAltText(film) {
        return `National flag of ${film.country}`;
    }

    String.prototype.sortable = function () {
        return this.replace(/^(A|The) /, "");
    }
});
