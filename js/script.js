"use strict";

$(function() {
    const __inactiveMapColour = "#555555";
    const __activeMapColours = [
        "#00CCFA",
        "#00C0EB",
        "#00B3DB",
        "#00A7CC",
        "#009ABD"
    ];

    let _map;
    let _films = {};
    let _filmsArraySorted = [];

    initialiseEventHandlers();

    loadData(function() {
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
            backgroundColor: "#f0f0f0",
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
                        style: "background-color: " + film.colour
                    })
                    .text(film.country)
                    .click(function(){
                        showFilmDetails(film.countryCode);
                    }));
        }
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
                : __inactiveMapColour;
        }
        return colours;
    }

    function getRandomActiveMapColour() {
        let index = Math.floor(Math.random() * __activeMapColours.length);
        return __activeMapColours[index];
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
                src: "https://flagpedia.net/data/flags/vector/" + film.countryCode.toLowerCase() + ".svg",
                alt: "National flag of " + film.country
            });

        $("#filmImageContainer")
            .toggleClass("defaultImage", !film.image);
        $("#filmImage")
            .prop({
                src: film.image,
                alt: "Film poster for " + film.title
            })
            .toggle(!!film.image);

        $("#filmOriginalTitle")
            .text(film.originalTitle)
            .toggle(!!film.originalTitle);

        $("#imdbLink")
            .prop({
                href: "https://www.imdb.com/title/" + film.imdb + "/"
            })
            .toggle(!!film.imdb);

        $("#letterboxdLink")
            .prop({
                href: "https://letterboxd.com/film/" + film.letterboxd + "/"
            })
            .toggle(!!film.letterboxd);

        $("#rottenTomatoesLink")
            .prop({
                href: "https://www.rottentomatoes.com/m/" + film.rottenTomatoes
            })
            .toggle(!!film.rottenTomatoes);

        $("#wikipediaLink")
            .prop({
                href: "https://en.wikipedia.org/wiki/" + film.wikipedia
            })
            .toggle(!!film.wikipedia);

        $("#justwatchLink")
            .prop({
                href: "https://www.justwatch.com/uk/movie/" + film.justwatch
            })
            .toggle(!!film.justwatch);

        $("#trailerLink")
            .prop({
                href: "https://www.youtube.com/watch?v=" + film.trailer
            })
            .toggle(!!film.trailer);

        $("#reviewLink")
            .prop({
                href: "https://www.youtube.com/watch?v=" + film.review
            })
            .toggle(!!film.review);

        $("#filmReviewer")
            .text(film.reviewer);

        $("#filmDetailsModal").modal();
    }
});