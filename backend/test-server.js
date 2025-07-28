const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Test server is working!');
});

app.get('/api/approved-companies', (req, res) => {
  res.json([]);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test server started on http://localhost:${PORT}`);
}); 