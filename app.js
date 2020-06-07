const express = require('express');
const bodeParser = require('body-parser');

const date = require('./date');

const app = express();

app.set('view engine', 'ejs');

let items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.use(bodeParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get('/', (req,res) => {

    const day = date.getDate();

    res.render('list',{
        listTitle: day,
        newListItem: items
    });
});

app.post('/', (req,res) => {

    const item = req.body.newItem;
    if(req.body.list === "Work List"){
        workItems.push(item);
        res.redirect('/work')
    } else{
        items.push(item);
        res.redirect('/');
    }
});


app.get('/work', (req,res) =>{
    res.render('list', {
        listTitle:'Work List',
        newListItem: workItems
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