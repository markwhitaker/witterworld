"use strict";

$(function () {
    console.log("ready");

    var map = new jvm.Map({
        map: "world_merc",
        container: $("#map"),
        backgroundColor: "#00000000",
        zoomMin: 0.9,
        focusOn: {
            x: 0.5,
            y: 0.5,
            scale: 0.9
        },
        series: {
            regions: [{
                attribute: "fill"
            }]
        },
        onRegionClick: function (_, countryCode) {
            var film = getFilmDetails(countryCode);
            console.log("Clicked " + countryCode + ": " + film.title);
            showFilmDetails(countryCode);
        }
    });

    var films = {};

    $.getJSON("data/films.json", function (dataArray) {
        dataArray.forEach(film => {
            films[film.countryCode] = film;
        });
        map.series.regions[0].setValues(getCountryColours());
    });

    function getCountryColours() {
        var colours = {};
        for (let region in map.regions) {
            colours[region] = films[region] ? "#00B3DB" : "#777777";
        }
        return colours;
    }

    function getFilmDetails(countryCode) {
        var film = films[countryCode];
        return (film ? film : {
            title: "No title available"
        });
    }

    function showFilmDetails(countryCode) {
        var film = films[countryCode];

        if (!film) {
            return;
        }

        $("#filmCountry").text(map.getRegionName(countryCode));
        $('#filmTitle').text(film ? film.title : "");
        $('#filmOriginalTitle').text(film && film.originalTitle ? film.originalTitle : "");
        $('#imdbLink').prop("href", "https://www.imdb.com/title/" + getImdbSlug(film) + "/");
        $('#letterboxdLink').prop("href", "https://letterboxd.com/film/" + getLetterboxdSlug(film) + "/");
        $('#wikipediaLink').prop("href", "https://en.wikipedia.org/wiki/" + getWikipediaSlug(film));
        $('#trailerLink').prop("href", getTrailerLink(film));

        $('#filmDetailsModal').modal()
    }

    function getImdbSlug(film) {
        return (film && film.imdb) ? film.imdb : "";
    }

    function getLetterboxdSlug(film) {
        return (film && film.letterboxd) ? film.letterboxd : "";
    }

    function getWikipediaSlug(film) {
        return (film && film.wikipedia) ? film.wikipedia : "";
    }

    function getTrailerLink(film) {
        return (film && film.trailer) ? film.trailer : "";
    }
});