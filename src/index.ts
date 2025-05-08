import express from 'express';
import dotenv from 'dotenv';
import employeeRouter from './routers/EmployeeRouter';
import { connectDB } from './infrastructure/database/db';

dotenv.config();

const app = express();
app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});


app.use('/api/employees', employeeRouter);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to the database:', err.message);
    process.exit(1); 
  });
