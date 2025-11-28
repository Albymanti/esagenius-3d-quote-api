import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { parseSTLAndGetMeshData, mm3ToCm3 } from './lib/stl-utils.js';
import { calculatePrice } from './config/pricing.js';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Esagenius 3D Quote API' });
});

// GET preventivo in base al volume (senza STL)
app.get('/api/quote', (req, res) => {
  const volume = parseFloat(req.query.volume);

  if (isNaN(volume) || volume <= 0) {
    return res.status(400).json({
      success: false,
      errorCode: 'BAD_VOLUME',
      message: 'Volume non valido. Usa ?volume=numero in cm3, es: /api/quote?volume=120'
    });
  }

  const infill = req.query.infill || 'ultra';
  const leadTime = req.query.leadTime || 'standard';

  const pricing = calculatePrice({
    volume_cm3: volume,
    infill,
    leadTime
  });

  return res.json({
    success: true,
    model: { volume_cm3: volume },
    pricing
  });
});

// POST preventivo da file STL
app.post('/api/quote-3d', upload.single('file'), async (req, res) => {
  try {
    const { infill = 'ultra', leadTime = 'standard' } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        errorCode: 'NO_FILE',
        message: 'File STL mancante.'
      });
    }

    const { volume_mm3, bbox } = await parseSTLAndGetMeshData(req.file.path);
    const { sizeX, sizeY, sizeZ } = bbox;

    const maxDim = Math.max(sizeX, sizeY, sizeZ);
    if (maxDim > 300) {
      return res.status(400).json({
        success: false,
        errorCode: 'MODEL_TOO_BIG',
        message: 'Il modello supera i 300 mm per lato.',
        dimensions_mm: {
          x: sizeX, y: sizeY, z: sizeZ
        }
      });
    }

    const volume_cm3 = mm3ToCm3(volume_mm3);

    const pricing = calculatePrice({
      volume_cm3,
      infill,
      leadTime
    });

    return res.json({
      success: true,
      model: {
        volume_cm3,
        dimensions_mm: { x: sizeX, y: sizeY, z: sizeZ }
      },
      pricing
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Errore interno.'
    });
  }
});

// PORT richiesta da Cloud Run
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Esagenius in ascolto sulla porta ${PORT}`);
});
