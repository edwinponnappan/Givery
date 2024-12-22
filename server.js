const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const app = express(); 
const port = 3000;

dotenv.config({path:'./env.yml'});

const db = mysql.createPool({
  host:'localhost',
  user:'root',
  password:'',
  database:'recipes'
})
app.use(express.json());

const recipes = [];
const apiBaseUrl = process.env.BASE_URL || '/api/v1'

console.log(`Base URL: ${apiBaseUrl}`);

app.post('${apiBaseUrl}/recipes', (req, res) => {
  const { title, making_time, serves, ingredients, cost} = req.body;
  
  if(!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(400).json({
      message:"Recipe creation failed!",
      required:"title, making_time, serves, ingredients, cost"
    });
  }

  const query = 'INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES (?, ?, ?, ?, ?)'; 
  const values = [title, making_time, serves, ingredients, cost]; 
  db.query(query, values, (err, results) => { 
    if (err) { 
      return res.status(500).json({ message: "Database error", error: err }); 
    }
    res.status(201).json({ 
      message: "Recipe successfully created", 
      recipe: { id: results.insertId, title, making_time, serves, ingredients, cost } 
    });
  });
});

app.get('${apiBaseUrl}/recipes', (req, res) => {
  const query = 'SELECT * FROM recipes';
  db.query(query, (err, results) => {
    if(err){
      return res.status(500).json({
        message:'failed to fetch'
      });
    }
    res.status(200).json({recipes:results})
  })  
});

app.get('${apiBaseUrl}/recipes/:id', (req, res) => {
  const recipeId = req.params.id;
  const query = 'SELECT * FROM recipes where id = ?';
  db.query(query, recipeId, (err, results) => {
    if(err){
      return res.status(500).json({
        message:'failed to fetch'
      });
    }
    if(results.length === 0){
      return res.status(404).json({
        message:'recipe with id ${recipeId} not found'
      });
    }
    res.status(200).json({
      message:'Recipe details by id',
      recipe:results
      })
  })
  
});

app.patch('${apiBaseUrl}/recipes/:id', (req, res) => {
  const { title, making_time, serves, ingredients, cost} = req.body;
  const recipeId = req.params.id;
  if(!title || !making_time || !serves || !ingredients || !cost) {
    return res.status(400).json({
      message:"Recipe updation failed",
      required:"title, making_time, serves, ingredients, cost"
    });
  }

  const updateQuery = 'UPDATE recipies set title = ?, making_time = ?, serves = ?, ingredients = ?, cost = ? WHERE id = ?'; 
  const updateValues = {title, making_time, serves, ingredients, cost}; 

  db.query(
    updateQuery, 
    [title, making_time, serves, ingredients, cost, recipeId], 
    (err, results) => { 
    if (err) { 
      return res.status(500).json({ message: "Database error", error: err }); 
    }
    if(results.affectedRows  === 0) {
      return res.status(404).json({
        message:'recipe with id ${recipeId} not found'
      });
    }
    res.status(200).json({ 
      message: "Recipe successfully updated!", 
      recipe: updateValues
    });
  });
});

app.delete('${apiBaseUrl}/recipes/:id', (req, res) => {
  const recipeId = req.params.id;
  const deleteQuery = 'DELETE FROM recipes where id = ?';
  db.query(deleteQuery, recipeId, (err, results) => {
    if(err){
      return res.status(500).json({
        message:'failed to delete'
      });
    }
    if(results.affectedRows === 0){
      return res.status(404).json({
        message:'No recipe found'
      });
    }
    res.status(200).json({
      message:'Recipe successfully removed!',
      recipe:results
      })
  })
  
});
app.get('/', (req, res) => {
  res.status(200).send('welcome to API');
});
// Start the server 
if(require.main == module){
  app.listen(port, () => `Server running at http://localhost:${port}`);
}
module.exports = app
