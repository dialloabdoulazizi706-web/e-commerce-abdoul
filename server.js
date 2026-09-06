const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à la base de données PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Route API : récupérer la liste des produits
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur SQL:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// Route API : ajouter un produit
app.post('/api/products', async (req, res) => {
  const { name, price, image_url, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, price, image_url, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, image_url, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur SQL:', err);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
