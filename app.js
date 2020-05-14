const express = require('express');
const bodeParser = require('body-parser');

const app = express();
var items = [];

app.set('view engine', 'ejs');

app.use(bodeParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get('/', (req,res) => {
    var kindOfDay = " ";
    const today = new Date();
    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    var day = today.toLocaleDateString("en-US",options);
    res.render('list',{
        kindOfDay: day,
        newListItem: items
    });
});

app.post('/', (req,res) => {
    item = req.body.newItem;
    items.push(item);
    console.log(item);
    res.redirect('/');
});

app.listen(3000);