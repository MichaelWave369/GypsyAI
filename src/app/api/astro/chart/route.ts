import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeChart, geocodePlace } from '@/lib/astro/engine';
import { demoAstroInterpretation } from '@/lib/ai/demo';

const schema = z.object({
  name: z.string().optional(),
  date: z.string(),
  time: z.string(),
  place: z.string().optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
  timezone: z.string().optional(),
  orb: z.number().optional(),
  zodiacMode: z.enum(['tropical', 'sidereal']).default('tropical'),
  minorAspects: z.boolean().optional(),
  demoMode: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  const data = schema.parse(await req.json());
  let lat = Number(data.lat);
  let lon = Number(data.lon);
  let timezone = data.timezone;

  if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && data.place) {
    const geo = await geocodePlace(data.place);
    lat = geo.lat;
    lon = geo.lon;
    timezone = geo.timezone;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'Missing coordinates or place lookup failed', ascendantAvailable: false }, { status: 400 });
  }

  const date = new Date(`${data.date}T${data.time}:00`);
  const chart = computeChart(date, lat, lon, data.orb ?? 6, data.zodiacMode, Boolean(data.minorAspects));
  const interpretation = demoAstroInterpretation(chart.placements, chart.aspects, chart.hermeticKeys);
  return NextResponse.json({ ...chart, timezone, interpretation, mode: data.demoMode ? 'demo' : 'computed' });
}
