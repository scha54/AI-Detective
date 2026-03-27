import express from 'express';
import cors from 'cors';
import { gameRouter } from './routes/game';
import { suspectRouter } from './routes/suspect';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/game', gameRouter);
app.use('/api/suspect', suspectRouter);

// Serve static files from the React frontend building output
const frontendPath = path.join(__dirname, '../public');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend server started on http://localhost:${port}`);
});
