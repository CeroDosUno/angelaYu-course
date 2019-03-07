//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});

const ItemSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true,'Why no name?']
  }
});

const Item = mongoose.model("Item",ItemSchema);

const item1 = new Item({
  name: "First item"
});

const item2 = new Item({
  name: "Workout for an hour."
});

const item3 = new Item({
  name: "eat lunch"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [ ItemSchema ]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find({}, function(err,foundItems) {
    if(foundItems.length == 0){
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Entered default items into todolist.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;

  Item.findOneAndDelete({_id: checkedItemID}, function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/");
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

    const item1 = new Item({
      name: itemName
    });

    if(listName === "Today"){
          item1.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function (err,foundList){
          foundList.items.push(item1);
          foundList.save();
          res.redirect("/" + listName);
        });
      }

});

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function (err,foundList){
    if(!err){
      if(!foundList){
        //if no list found, create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);


      }
      else{
        //render exisiting list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }

  });

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});