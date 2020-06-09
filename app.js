const express = require('express');
const bodeParser = require('body-parser');
const mongoose = require('mongoose');
const date = require('./date');
// const ejsLint = require('ejs-lint');

const app = express();

app.set('view engine', 'ejs');

app.use(bodeParser.urlencoded({extended: true}));
app.use(express.static("public"));

// let items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const url = "mongodb://localhost:27017/todolistDB";

mongoose.connect(url, { useNewUrlParser: true });

mongoose.set('useUnifiedTopology', true);

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist! "
});

const item2 = new Item({
    name: "Hit + button to add new item. "
});

const item3 = new Item({
    name: "<-- Hit the this to delete an item. "
});

const defaultItems = [item1, item2, item3];

//for custom routes
const listSchema = new mongoose.Schema({
    name: String,
    items:[itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get('/', (req,res) => {

    const day = date.getDate();

    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err) {
             if(err){
                 console.log(err);
             } else{
                 console.log("No error");
             }
            });
            res.redirect('/');
        }else{
            res.render('list',{
                listTitle: day,
                newListItem: foundItems
            });
        }       
    });   

});

app.get('/:customListName', (req,res) =>{
    //console.log(req.params.customListName);
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, (err, foundList) => {
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();

                res.redirect('/' + customListName);

            } else{
                //show an existing lits
                res.render('list', {
                    listTitle: foundList.name,
                    newListItem: foundList.items
                });
            }
        }
    });

   

});

app.post('/', (req,res) => {
    const itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });

    item.save();

    res.redirect('/');
});

app.post('/delete', (req, res) => {
    // console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemId, (err) => {
        if(err){
            console.log(err);
        } else{
            console.log("Successfully removed item");
            res.redirect('/');
        }
    });

});

// app.post('/work', (req,res) => {
//     let workItem = req.body.newItem;
//     workItems.push(workItem);
//     res.redirect('/work');
// });

app.get('/about', (req,res) => {
    res.render('about');
})

app.listen(3000);