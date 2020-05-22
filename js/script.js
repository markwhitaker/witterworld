"use strict";

$(function () {
    const inactiveMapColour = "#555555";
    const activeMapColours = [
        "#00CCFA",
        "#00C0EB",
        "#00B3DB",
        "#00A7CC",
        "#009ABD"
    ];

    var map;
    var filmsArraySorted = [];
    var films = {};

    initialiseMap();
    initialiseEventHandlers();
    loadData();

    //-----------------------------------------------------------

    function initialiseMap() {
        map = new jvm.Map({
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
    }

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

    function loadData() {
        $.getJSON("data/films.json", function (data) {
            filmsArraySorted = data.sort(function (a, b) {
                return (a.country < b.country) ? -1 :
                    (a.country > b.country) ? 1 : 0;
            });
            for (let i = 0; i < filmsArraySorted.length; i++) {
                let film = filmsArraySorted[i];
                films[film.countryCode] = film;
            }
            setMapColours();
            populateFilmList();
        });
    }

    function setMapColours() {
        map.series.regions[0].setValues(getCountryColours());
    }

    function showMap() {
        $("#btnShowMap").addClass("selected");
        $("#mapContainer").show();
        $("#btnShowList").removeClass("selected");
        $("#listContainer").hide();
    }

    function showList() {
        $("#btnShowList").addClass("selected");
        $("#listContainer").show();
        $("#btnShowMap").removeClass("selected");
        $("#mapContainer").hide();
    }

    function populateFilmList() {
        $("#list").empty();

        for (let i = 0; i < filmsArraySorted.length; i++) {
            let film = filmsArraySorted[i];
            $("#list").append(
                $("<span></span>")
                    .addClass("listFilm")
                    .prop("style", "background-color: " + getRandomActiveMapColour())
                    .text(film.country)
                    .click(function(){
                        showFilmDetails(film.countryCode);
                    }));
        }
    }

    function getCountryColours() {
        var colours = {};
        for (let region in map.regions) {
            colours[region] = films[region]
                ? getRandomActiveMapColour()
                : inactiveMapColour;
        }
        return colours;
    }

    function getRandomActiveMapColour() {
        let index = Math.floor(Math.random() * activeMapColours.length);
        return activeMapColours[index];
    }

    function showFilmDetails(countryCode) {
        var film = films[countryCode];

        if (!film) {
            return;
        }

        $("#filmCountry").text(film.country);
        $("#filmTitle").text(film.title);
        $("#filmYear").text(film.year);
        $("#filmCountryFlag")
            .prop("src", "https://flagpedia.net/data/flags/vector/" + film.countryCode.toLowerCase() + ".svg")
            .prop("alt", "National flag of " + film.country);

        $("#filmImageContainer")
            .toggleClass("defaultImage", film.image == null);
        $("#filmImage")
            .prop("src", film.image)
            .toggle(film.image != null);

        $("#filmOriginalTitle")
            .text(film.originalTitle)
            .toggle(film.originalTitle != null);

        $("#imdbLink")
            .prop("href", "https://www.imdb.com/title/" + film.imdb + "/")
            .toggle(film.imdb != null);

        $("#letterboxdLink")
            .prop("href", "https://letterboxd.com/film/" + film.letterboxd + "/")
            .toggle(film.letterboxd != null);

        $("#rottenTomatoesLink")
            .prop("href", "https://www.rottentomatoes.com/m/" + film.rottenTomatoes)
            .toggle(film.rottenTomatoes != null);

        $("#wikipediaLink")
            .prop("href", "https://en.wikipedia.org/wiki/" + film.wikipedia)
            .toggle(film.wikipedia != null);

        $("#justwatchLink")
            .prop("href", "https://www.justwatch.com/uk/movie/" + film.justwatch)
            .toggle(film.justwatch != null);

        $("#trailerLink")
            .prop("href", film.trailer)
            .show(film.trailer != null);

        $("#filmDetailsModal").modal();
    }
});