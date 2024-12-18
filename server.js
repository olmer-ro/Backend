const express = require('express');
const cors = require('cors');  // Importamos el middleware CORS
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Usamos CORS para permitir solicitudes desde cualquier origen
app.use(cors()); // Esto habilita CORS para todos los orígenes

// También puedes configurar CORS para permitir un origen específico:
// app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());

// Ruta para leer el archivo JSON
const readItemsFromFile = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf-8', (err, data) => {
            if (err) reject('Error al leer los datos');
            else resolve(JSON.parse(data));
        });
    });
};

// Ruta para escribir en el archivo JSON
const writeItemsToFile = (items) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, 'data', 'items.json'), JSON.stringify(items, null, 2), (err) => {
            if (err) reject('Error al guardar los datos');
            else resolve();
        });
    });
};

// Función para validar los datos del item
const validateItemData = (item) => {
    if (!item.name || typeof item.name !== 'string') {
        throw new Error('El nombre del producto es obligatorio y debe ser una cadena');
    }
};

// Ruta para la raíz ("/")
app.get('/', (req, res) => {
    res.send('¡Bienvenido al servidor!');
});

// Ruta para obtener todos los elementos
app.get('/api/items', async (req, res) => {
    try {
        const items = await readItemsFromFile();
        res.json(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Ruta para agregar un nuevo elemento
app.post('/api/items', async (req, res) => {
    try {
        const newItem = req.body;

        // Validar datos
        validateItemData(newItem);

        // Leer items actuales
        const items = await readItemsFromFile();

        // Asignar un id único al nuevo producto
        newItem.id = String(Date.now()); // Generación de ID basado en el tiempo actual

        items.push(newItem);
        await writeItemsToFile(items);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Ruta para actualizar un elemento
app.put('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = req.body;

        // Validar datos
        validateItemData(updatedItem);

        // Leer items actuales
        let items = await readItemsFromFile();

        // Buscar el item a actualizar
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return res.status(404).send('Elemento no encontrado');

        // Actualizar el item
        items[index] = { ...items[index], ...updatedItem };

        await writeItemsToFile(items);
        res.json(items[index]);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Ruta para eliminar un elemento
app.delete('/api/items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Leer items actuales
        let items = await readItemsFromFile();

        // Filtrar el item a eliminar
        const filteredItems = items.filter(item => item.id !== id);
        if (filteredItems.length === items.length) return res.status(404).send('Elemento no encontrado');

        await writeItemsToFile(filteredItems);
        res.status(204).send();
    } catch (err) {
        res.status(500).send('Error al eliminar los datos');
    }
});

app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
