import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/api/directions", async (req, res) => {
  const { startLng, startLat, goalLng, goalLat } = req.query;

  try {
    const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${startLng},${startLat}&goal=${goalLng},${goalLat}`;

    const response = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": process.env.CLIENT_KEY,
        "X-NCP-APIGW-API-KEY": process.env.CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 호출 오류 (${response.status}): ${errorText}`);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(`내부 오류: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Directions API 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
