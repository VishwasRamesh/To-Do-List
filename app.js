const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require('./date');
const _ = require("lodash");
// const ejsLint = require('ejs-lint');

const app = express();

app.set('view engine', 'ejs');

// app.use(bodeParser.urlencoded({extended: true})); <-- depricated

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// let items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const url = "mongodb://localhost:27017/todolistDB";

mongoose.connect(url, { useNewUrlParser: true });

mongoose.set('useUnifiedTopology', true);

//Creating mongoose schema
const itemsSchema = new mongoose.Schema({
    name: String
});

//Creating mongoose model
const Item = mongoose.model("Item", itemsSchema);

//Creating documents item1, item2, item3
const item1 = new Item({
    name: "Welcome to your todolist! "
});

const item2 = new Item({
    name: "Hit + button to add new item. "
});

const item3 = new Item({
    name: "<-- Hit the this to delete an item. "
});

//Array of the documents for inserting into mongodb using insertMany()
const defaultItems = [item1, item2, item3];

//for custom routes
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res) {

    const day = date.getDate();
    //fetching elements form db
    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err) {
                if(err){
                    console.log(err);
                } else{
                    console.log("Successfully saved to db");
                }
            });
            res.redirect("/");
        }else{
            res.render("list",{
                listTitle: "Today",
                newListItem: foundItems,
                day : day
            });
        }       
    });   

});

app.get("/:customListName", function(req,res){
    //console.log(req.params.customListName);
    const day = date.getDate();
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);

            } else{
                //show an existing lits
                res.render("list", {
                    listTitle: foundList.name,
                    newListItem: foundList.items,
                    day : day
                });
            }
        }
    });

   

});

// app.post('/', (req,res) => {
//     const itemName = req.body.newItem;
//     const listName = req.body.list;

//     const day = date.getDate();

//     const item = new Item({
//         name: itemName
//     });

//     if(listName === day){
//         item.save();
//         res.redirect('/');
//     } else{
//         List.findOne({name: listName}, function(err, foundList){
//             foundList.items.push(item);
//             foundList.save();
//             res.redirect("/" + listName);
//         });
//     }

   
// });

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list.slice(0,-1);//name of button
    //console.log(listName);
 
    const item = new Item({
      name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});


app.post("/delete", function(req, res){
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});
// app.post("/delete", function(req, res){
//     // console.log(req.body.checkbox);
//     const checkedItemId = req.body.checkbox;
//     const listName = req.body.listName;

//     const day = date.getDate();
//     if(listName==day){
//         Item.findByIdAndRemove(checkedItemId, function(err){
//             if(err){
//                 console.log(err);
//             } else{
//                 console.log("Successfully removed item");
//                 res.redirect("/");
//             }
//         });
//     } else{
//         List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: checkedItemId}}}, function(err, foundList){
//             if(!err){
//                 res.redirect("/"+listName);
//             }
//         });

//     }  

// });



// app.post('/work', (req,res) => {
//     let workItem = req.body.newItem;
//     workItems.push(workItem);
//     res.redirect('/work');
// });

app.get('/about', function(req,res){
    res.render('about');
})

app.listen(3000, function(){
    console.log("Server started on port 3000");
});