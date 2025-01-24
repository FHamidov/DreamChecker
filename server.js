const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Local storage əvəzinə sadə DB
let dreamsDB = [];

app.post('/api/analyze-dream', async (req, res) => {
    try {
      const { description } = req.body;
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: `Bu yuxunu təhlil et: "${description}". 3 cümlədən çox olmayaraq izah et.` }]
          }]
        }
      );
  
      // Təhlükəsiz data çıxarışı
      const analysis = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                      response.data?.error?.message || 
                      "Təhlil alına bilmədi. Zəhmət olmasa təsviri yoxlayın.";
  
      res.json({ analysis }); // { analysis: string } formatına diqqət!
  
    } catch (error) {
      res.status(500).json({ 
        analysis: "AI xətası: " + error.message // Frontend "analysis" açarını gözləyir
      });
    }
  });

app.listen(process.env.PORT || 3000, () => console.log('Server işləyir'));