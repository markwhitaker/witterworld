"use strict";

$(function () {
    console.log("ready");

    var films = {};

    $.getJSON("data/films.json", function (dataArray) {
        dataArray.forEach(element => {
            films[element.code] = element;
        });
    });

    $("#map").vectorMap({
        map: "world_merc",
        onRegionClick: function (_, countryCode) {
            var film = getFilmDetails(countryCode);
            console.log("Clicked " + countryCode + ": " + film.title);
            showFilmDetails(countryCode);
        }
    })

    function getFilmDetails(countryCode) {
        var film = films[countryCode];
        return (film ? film : {
            title: "No title available"
        });
    }

    function showFilmDetails(countryCode) {
        var film = films[countryCode];

        $('#filmTitle').text(film ? film.title : "");
        $('#filmOriginalTitle').text(film && film.originalTitle ? film.originalTitle : "");
        $('#filmIMDb').html(film && film.imdb ? "<a href=\"https://www.imdb.com/title/" + film.imdb + "/\">Go to IMDb</a>" : "");
        $('#filmWikipedia').html(film && film.wikipedia ? "<a href=\"https://en.wikipedia.org/wiki/" + film.wikipedia + "\">Go to Wikipedia</a>" : "");
        $('#filmTrailer').html(film && film.trailer ? "<a href=\"" + film.trailer + "\">Watch the trailer</a>" : "");
    }
});