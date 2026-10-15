import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory cache for batches and topics
let batchesCache: any[] | null = null;
const classroomCache = new Map<string, { data: any; timestamp: number }>();
const lessonCache = new Map<string, { data: any; timestamp: number }>();
const videoCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// Helper to load batches
async function getBatchesData() {
  if (batchesCache && batchesCache.length > 0) {
    return batchesCache;
  }

  // Try local file first
  try {
    const localFilePath = path.join(__dirname, 'src', 'data', 'batches.json');
    if (fs.existsSync(localFilePath)) {
      const fileData = fs.readFileSync(localFilePath, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        batchesCache = parsed;
        console.log(`Loaded ${parsed.length} batches from local cache`);
        return batchesCache;
      }
    }
  } catch (err) {
    console.error('Error reading local batches file:', err);
  }

  // Fetch from source
  try {
    const res = await fetch('https://sahuvijay143.github.io/kgs_batch_list/New_Sunny.json');
    if (res.ok) {
      batchesCache = await res.json();
      console.log(`Fetched ${batchesCache?.length} batches from remote`);
      return batchesCache;
    }
  } catch (err) {
    console.error('Error fetching batches from remote:', err);
  }

  return batchesCache || [];
}

// Pre-load batches on boot
getBatchesData().catch(() => {});

// Batches endpoint
app.get('/api/batches', async (req: Request, res: Response) => {
  try {
    const batches = await getBatchesData();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve batches' });
  }
});

// Classroom / Subjects endpoint for a batch
app.get('/api/classroom/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const now = Date.now();

  const cached = classroomCache.get(batchId);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const upstreamUrl = `https://sahukgs.com/api/classroom/${batchId}`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ classroom: [] });
    }

    const data = await upstream.json();
    classroomCache.set(batchId, { data, timestamp: now });
    res.json(data);
  } catch (err: any) {
    console.error(`Classroom fetch error for batch ${batchId}:`, err.message);
    res.status(502).json({ error: 'Failed to fetch classroom topics', classroom: [] });
  }
});

// Lesson endpoint (classes, videos, notes)
app.get('/api/lesson/:lessonId', async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const now = Date.now();

  const cached = lessonCache.get(lessonId);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const upstreamUrl = `https://sahukgs.com/api/lesson/${lessonId}`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Lesson not found', videos: [], notes: [] });
    }

    const data = await upstream.json();
    lessonCache.set(lessonId, { data, timestamp: now });
    res.json(data);
  } catch (err: any) {
    console.error(`Lesson fetch error for lesson ${lessonId}:`, err.message);
    res.status(502).json({ error: 'Failed to fetch lesson details', videos: [], notes: [] });
  }
});

// Today's classes endpoint
app.get('/api/today/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  try {
    const upstream = await fetch(`https://sahukgs.com/api/today/${batchId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!upstream.ok) return res.json({ todayclasses: [] });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.json({ todayclasses: [] });
  }
});

// Timetable endpoint
app.get('/api/timetable/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  try {
    const upstream = await fetch(`https://sahukgs.com/api/timetable/${batchId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!upstream.ok) return res.json({ timetable: {} });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.json({ timetable: {} });
  }
});

// Updates endpoint
app.get('/api/updates/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  try {
    const upstream = await fetch(`https://sahukgs.com/api/updates/${batchId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!upstream.ok) return res.json({ updates: [] });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.json({ updates: [] });
  }
});

// Video endpoint (video player links, streams, pdfs)
app.get('/api/video/:videoId', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const now = Date.now();

  const cached = videoCache.get(videoId);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const upstreamUrl = `https://sahukgs.com/api/video/${videoId}`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Video details not found' });
    }

    const data = await upstream.json();
    videoCache.set(videoId, { data, timestamp: now });
    res.json(data);
  } catch (err: any) {
    console.error(`Video fetch error for video ${videoId}:`, err.message);
    res.status(502).json({ error: 'Failed to fetch video details' });
  }
});

// PDF stream / download proxy to avoid browser CORS issues on akamai/external storage
app.get('/api/pdf-proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  const download = req.query.download === 'true';
  const filename = (req.query.filename as string) || 'GB-STUDY-Note.pdf';

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid PDF URL');
  }

  try {
    const upstream = await fetch(targetUrl);
    if (!upstream.ok) {
      return res.status(upstream.status).send('Failed to fetch PDF document');
    }

    const contentType = upstream.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    }

    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(502).send('Error streaming PDF');
  }
});

// Vite middleware or production static
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`GB STUDY Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
