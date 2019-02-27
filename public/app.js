$(document).ready(function () {
  let articleContainer = $("#article-container");
  $(document).on("click", ".save-article", handleArticleSave);
  $(document).on("click", "#scrape-new", handleArticleScrape);
  $(document).on("click", "#clear", handleArticleClear);
  $(document).on('click', '#saved-articles', displaySavedArticles);

  function displaySavedArticles() {
      articleContainer.empty();

      $.get("/api/articles/saved").then(function() {
        console.log('getting saved articles');
        renderArticlesSaved();
      })
  }

  function renderArticlesSaved() {
    $.getJSON("/api/articles/saved", function (data) {
      console.log(data[i]);
      // For each one
      for (var i = 0; i < data.length; i++) {
        console.log(data[i]);
        // Display the appropriate information on the page
        $("#article-container").append("<div class='new-article' data-id='" + data[i]._id + "'><a href class='save-article'>Save Article</a><p class='article-title' data-id='" + data[i]._id + "'>" + data[i].title + "</p>" + "<p class='article-link'>" + data[i].link + "</p></div>");
      }
    });
  }


  // Grab the articles as a json
  function renderArticles() {
    $.getJSON("/api/articles", function (data) {
      // For each one
      for (var i = 0; i < data.length; i++) {
        // Display the approriate information on the page
        $("#article-container").append("<div class='new-article' data-id='" + data[i]._id + "'><a href class='save-article'>Save Article</a><p class='article-title' data-id='" + data[i]._id + "'>" + data[i].title + "</p>" + "<p class='article-link'>" + data[i].link + "</p></div>");
      }
    });
  }


  function handleScrapeData() {
    // Run an AJAX request for saved headlines
    $.get("/api/articles").then(function (data) {
      articleContainer.empty();
      // If we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      } else {
        // Otherwise render a message explaining we have no articles
        // renderEmpty();
      }
    });
  }

  function handleArticleScrape() {
    // This function handles the user clicking any "scrape new article" buttons
    $.get("api/scrape").then(function() {
      handleScrapeData();
    });
  }


  function handleArticleSave() {
    event.preventDefault();
    // This function is triggered when the user wants to save an article
    var articleToSave = $(this).parent(".new-article").data('id');
    // console.log(articleToSave);

    $.get("api/articles/" + articleToSave).then(function (data) {
      // pass article id to server to save article
      console.log('article save call ran from app.js');
    });
  }

  function handleArticleClear() {
    articleContainer.empty();
    $.get("api/clear").then(function () {
      //
    });
  }
});