const express = require('express');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Oroge API!'});
});

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});
  
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: {
        message: err.message
        }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});