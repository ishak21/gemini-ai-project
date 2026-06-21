import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY tidak ditemukan di file .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Body request harus memiliki properti "messages" berupa array.',
      });
    }
    if (messages.length === 0) {
      return res.status(400).json({ error: 'Array messages tidak boleh kosong.' });
    }

    const contents = messages.map((m) => ({
      role: m.role === 'bot' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.message }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.7,
        systemInstruction:
          'Kamu adalah asisten AI yang ramah, jawab dengan bahasa Indonesia yang jelas dan singkat kecuali diminta detail.',
      },
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Error saat memproses chat:', error.message);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghubungi Gemini AI.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Model Gemini yang digunakan: ${GEMINI_MODEL}`);
});
