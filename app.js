//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://abadijerry44:wgPWQWyrIqpIA6EM@jerryabadi.rdjiydi.mongodb.net/todolistDB", {useNewUrlParser: true});
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item ({
  name: "Welcome to your todolist!"
});
const item2 = new Item ({
  name: "Hit the + button to add a new file"
});
const item3 = new Item ({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);



app.get("/", async(req, res)=> {
  try{
  const foundItems = await Item.find({});
  if(foundItems.length === 0){
    Item.insertMany(defaultItems);
    res.redirect("/");
  } else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  } catch (err) {
    console.log(err);
  }
});

app.get("/:customListName", async(req, res)=>{
  try{
  const customListName = _.capitalize(req.params.customListName);
  const foundList = await List.findOne({name:customListName}); 
  if (!foundList){
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
    res.redirect("/" + customListName);
  } else {
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
  } catch(err){
    console.log(err);
  } 
});

app.post("/", async(req, res)=>{
  try{
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const foundList = await List.findOne({name:listName});
  const item = new Item({
  name: itemName
  });
  if(listName === "Today"){
  item.save();
  res.redirect("/");  
  } else{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
} catch(err){
  console.log(err);
}
});


app.post("/delete", async (req, res) => {
  try {
     const checkedItemId = await req.body.checkbox;
     const listName = await req.body.listName;
     const foundList = await List.findOne({name:listName});

     if(listName === "Today"){
      Item.findByIdAndRemove({_id: checkedItemId}). exec();
      res.redirect("/");
     } else{
      List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}});
      if(!err){
        res.redirect("/" + listName);
      };
      
     };
    
  } catch(err) {
    console.log(err);
  }
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server has started successfully");
});
