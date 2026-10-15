import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
let batchesCache: any[] | null = null;
const classroomCache = new Map<string, { data: any; timestamp: number }>();
const lessonCache = new Map<string, { data: any; timestamp: number }>();
const videoCache = new Map<string, { data: any; timestamp: number }>();

async function getBatchesData() {
  if (batchesCache && batchesCache.length > 0) {
    return batchesCache;
  }
  try {
    const res = await fetch('https://sahuvijay143.github.io/kgs_batch_list/New_Sunny.json');
    if (res.ok) {
      batchesCache = await res.json();
      return batchesCache;
    }
  } catch (err) {
    console.error('Remote batches fetch error:', err);
  }
  return batchesCache || [];
}

app.get('/api/batches', async (req: Request, res: Response) => {
  try {
    const batches = await getBatchesData();
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(batches);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve batches' });
  }
});

app.get('/api/classroom/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const now = Date.now();
  const cached = classroomCache.get(batchId);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const upstream = await fetch(`https://sahukgs.com/api/classroom/${batchId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!upstream.ok) return res.status(upstream.status).json({ classroom: [] });
    const data = await upstream.json();
    classroomCache.set(batchId, { data, timestamp: now });
    res.json(data);
  } catch {
    res.status(502).json({ error: 'Failed to fetch classroom topics', classroom: [] });
  }
});

app.get('/api/lesson/:lessonId', async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const now = Date.now();
  const cached = lessonCache.get(lessonId);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const upstream = await fetch(`https://sahukgs.com/api/lesson/${lessonId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'Lesson not found', videos: [], notes: [] });
    const data = await upstream.json();
    lessonCache.set(lessonId, { data, timestamp: now });
    res.json(data);
  } catch {
    res.status(502).json({ error: 'Failed to fetch lesson details', videos: [], notes: [] });
  }
});

app.get('/api/today/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  try {
    const upstream = await fetch(`https://sahukgs.com/api/today/${batchId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!upstream.ok) return res.json({ todayclasses: [] });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.json({ todayclasses: [] });
  }
});

app.get('/api/timetable/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  try {
    const upstream = await fetch(`https://sahukgs.com/api/timetable/${batchId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!upstream.ok) return res.json({ timetable: {} });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.json({ timetable: {} });
  }
});

app.get('/api/updates/:batchId', async (req: Request, res: Response) => {
  const { batchId } = req.params;
  try {
    const upstream = await fetch(`https://sahukgs.com/api/updates/${batchId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!upstream.ok) return res.json({ updates: [] });
    const data = await upstream.json();
    res.json(data);
  } catch {
    res.json({ updates: [] });
  }
});

app.get('/api/video/:videoId', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const now = Date.now();
  const cached = videoCache.get(videoId);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const upstream = await fetch(`https://sahukgs.com/api/video/${videoId}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'Video details not found' });
    const data = await upstream.json();
    videoCache.set(videoId, { data, timestamp: now });
    res.json(data);
  } catch {
    res.status(502).json({ error: 'Failed to fetch video details' });
  }
});

app.get('/api/pdf-proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  const download = req.query.download === 'true';
  const filename = (req.query.filename as string) || 'GB-STUDY-Note.pdf';

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid PDF URL');
  }

  try {
    const upstream = await fetch(targetUrl);
    if (!upstream.ok) return res.status(upstream.status).send('Failed to fetch PDF document');
    const contentType = upstream.headers.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    }
    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch {
    res.status(502).send('Error streaming PDF');
  }
});

export default app;
