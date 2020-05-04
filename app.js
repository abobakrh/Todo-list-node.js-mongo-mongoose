const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.engine('ejs', require('ejs').__express);
app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended : true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://user-abobakr:test123@cluster0-e1khm.mongodb.net/todolistDB",{ useNewUrlParser: true});

const item_schema = {
  name : String
};

const item = mongoose.model("item",item_schema);

const new_item1 = new item({
  name : "welcome to the updated todo list"
});
const new_item2 = new item({
  name : "Hit the + button to add new tasks "
});
const new_item3 = new item({
  name : "<< press that box to cross out finished tasks"
});

const default_items = [new_item1,new_item2,new_item3];
const list_schema = {
  name : String,
  items : [item_schema]
};
const list = mongoose.model("List",list_schema);

app.get("/",function(req,res){
  item.find({},function(err , found_items){

    if (found_items.length === 0){

      item.insertMany(default_items,function(err){
        if(err){
          console.log("error inserting default items ");
        }else{
          console.log("success : put items in db");
        }
      });
      res.redirect("/");

    }else {
      res.render("list",{kindofday : "Today", listitem : found_items});
    }
  });
});

app.get("/:custom_list_name" , function(req,res){
  const custom_list =_.capitalize(req.params.custom_list_name);
  list.findOne({name : custom_list},function(err,results){
    if(!err){
      if (!results){
        const newlist = new list({
          name : custom_list,
          items : default_items
        });
        newlist.save();
        res.redirect("/" + custom_list);
      }else{
        res.render("list",{kindofday : results.name, listitem : results.items});
      }
    }
  });
});

app.post("/",function(req,res){
  var item_enterd = req.body.text_entered;
  var list_name = req.body.button
  const newitem = new item({
    name : item_enterd
  });
  if (list_name === "Today"){
    newitem.save();
    res.redirect("/");
  }else{
    list.findOne({name : list_name},function(err,found_list){
      console.log("found list");
      found_list.items.push(newitem);
      console.log("pushed item");
      found_list.save();
      res.redirect("/" + list_name);
    });
  }


});

app.post("/delete",function(req,res){
  const checked_item_id = req.body.checkfield;
  const listName = req.body.listName;

  if (listName === "today"){
    item.findByIdAndRemove(checked_item_id,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully removed item");
      }
      res.redirect("/");
    });
  }else{
    list.findOneAndUpdate({name : listName},{$pull: {items : {_id : checked_item_id} } },function(err,found_list){
      if (! err){
        res.redirect("/" + listName);
      }
    });
  }



});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port);

app.listen(port,function(){
  console.log("server has started");
});
