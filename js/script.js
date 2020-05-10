"use strict";

$(function () {
    console.log("ready");

    var map = new jvm.Map({
        map: "world_merc",
        container: $("#map"),
        onRegionClick: function (_, countryCode) {
            var film = getFilmDetails(countryCode);
            console.log("Clicked " + countryCode + ": " + film.title);
            showFilmDetails(countryCode);
        }
    });

    var films = {};

    $.getJSON("data/films.json", function (dataArray) {
        dataArray.forEach(element => {
            films[element.code] = element;
        });
    });

    function getFilmDetails(countryCode) {
        var film = films[countryCode];
        return (film ? film : {
            title: "No title available"
        });
    }

    function showFilmDetails(countryCode) {
        var film = films[countryCode];

        $("#country").text(map.getRegionName(countryCode));
        $('#filmTitle').text(film ? film.title : "");
        $('#filmOriginalTitle').text(film && film.originalTitle ? film.originalTitle : "");

        $('#imdbLink')
            .prop("href", "https://www.imdb.com/title/" + getImdbSlug(film) + "/")
            .toggle(getImdbSlug(film) != "");

        $('#letterboxdLink')
            .prop("href", "https://letterboxd.com/film/" + getLetterboxdSlug(film) + "/")
            .toggle(getLetterboxdSlug(film) != "");

        $('#wikipediaLink')
            .prop("href", "https://en.wikipedia.org/wiki/" + getWikipediaSlug(film))
            .toggle(getWikipediaSlug(film) != "");

        $('#trailerLink')
            .prop("href", getTrailerLink(film))
            .toggle(getTrailerLink(film) != "");
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