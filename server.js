let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");
let axios = require("axios");
let cheerio = require("cheerio");

// Require all models
let db = require("./models");

let PORT = 3000;

// Initialize Express
let app = express();

// ======Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));


// Connects mongo database to mongoose
// mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

// ======Routes

// A GET route for scraping the echoJS website
app.get("/api/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    let $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          // console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/api/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for saving an article 
app.get("/api/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOneAndUpdate({ _id: req.params.id }, {$set: {saved: true}}, {new: true},
      function(err, doc){
          if(err){
              console.log(err);
          }
      }
    );
});


// Route for getting all saved articles
app.get("api/articles/saved", function(req, res) {
  db.Article.find().select({"_id": 0, "saved": true})
    .then(function(dbSavedArticles) {
      console.log(dbSavedArticles);
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbSavedArticles);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for clearing all Articles from the db
app.get("/api/clear", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.deleteMany()
    .then(function(dbArticle) {
      console.log('All articles cleared from db');
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});