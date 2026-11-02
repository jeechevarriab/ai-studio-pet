// Fixed coastal reference points, not surveyed break or buoy coordinates.
export const spots = Object.freeze([
  {id: 'wilderness', name: 'Wilderness Beach', latitude: 18.49, longitude: -67.17},
  {id: 'surfers', name: 'Surfers Beach', latitude: 18.51, longitude: -67.15},
  {id: 'jobos', name: 'Jobos Beach', latitude: 18.51, longitude: -67.08}
]);
const ttl = 10 * 60 * 1000;
const finite = (v, min, max) => Number.isFinite(v) && v >= min && v <= max ? v : null;
export function estimatedEnergy(waveM, periodS) {
  if (finite(waveM, 0, 40) === null || finite(periodS, .1, 40) === null) return null;
  // Equivalent regular deep-water wave, energy passing a 1 m crest width per period.
  // EMSD: P = rho*g^2*H^2*T/(32*pi) W/m; E=P*T, divided by 1000 -> kJ/m.
  return Math.round(1025 * 9.80665 ** 2 * waveM ** 2 * periodS ** 2 / (32 * Math.PI * 1000));
}
export function tideStage(raw, now = Date.now()) {
  if (!Array.isArray(raw?.predictions)) return null;
  const points = raw.predictions.filter(p => ['H','L'].includes(p.type) && /^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(p.t)).map(p=>({time:Date.parse(p.t.replace(' ','T')+':00Z'),type:p.type})).sort((a,b)=>a.time-b.time);
  const previous = points.findLast(p=>p.time<=now), next = points.find(p=>p.time>now);
  if (!previous || !next || now-previous.time>18*3600000 || next.time-now>18*3600000) return null;
  const turn = points.find(p=>Math.abs(p.time-now)<=30*60000);
  return {stage:turn ? (turn.type==='H'?'High':'Low') : next.type==='H'?'Rising':'Falling',station:'9759412',stationName:'Aguadilla, Crashboat Beach',nextTime:next.time,nextType:next.type};
}
export function normalizeSurf(raw, fetchedAt = Date.now()) {
  if (!Array.isArray(raw) || raw.length !== spots.length) throw Error('Invalid marine forecast response');
  return {source: 'Open-Meteo Marine',sourceUrl: 'https://open-meteo.com/en/docs/marine-weather-api',fetchedAt,expiresAt: fetchedAt + ttl,kind: 'offshore-model',spots: spots.map((spot, i) => {
    const row = raw.find((item, index) => (item.location_id ?? index) === i), c = row?.current;
    if (!c || row.current_units?.wave_height !== 'm' || row.current_units?.wave_period !== 's' || row.current_units?.wave_direction !== '°') throw Error('Unexpected marine units');
    const waveM = finite(c.wave_height, 0, 40);
    const sample = finite(c.time, 0, 1e12);
    return {...spot,modelLatitude: finite(row.latitude, -90, 90),modelLongitude: finite(row.longitude, -180, 180),sampleTime: sample === null ? null : sample * 1000,waveFeet: waveM === null ? null : Math.round(waveM * 3.28084 * 10) / 10,periodSeconds: finite(c.wave_period, 0, 40),directionDegrees: finite(c.wave_direction, 0, 360),energyKJPerMeter:estimatedEnergy(waveM,c.wave_period)};
  })};
}
export function createSurfReader(fetcher = fetch) {
  let cached = null, pending = null;
  return async function read() {
    if (cached && Date.now() < cached.expiresAt) return cached;
    if (pending) return pending;
    pending = (async () => {
      const url = new URL('https://marine-api.open-meteo.com/v1/marine');
      url.search = new URLSearchParams({latitude: spots.map(s=>s.latitude).join(','),longitude: spots.map(s=>s.longitude).join(','),current: 'wave_height,wave_period,wave_direction',timezone: 'America/Puerto_Rico',timeformat: 'unixtime',cell_selection: 'sea',forecast_days: '1'}).toString();
      const response = await fetcher(url, {signal: AbortSignal.timeout(8000),redirect: 'error'});
      if (!response.ok) throw Error('Marine provider unavailable');
      const text = await response.text();
      if (text.length > 50000) throw Error('Marine response too large');
      const data = normalizeSurf(JSON.parse(text));
      const windUrl = new URL('https://api.open-meteo.com/v1/forecast');
      windUrl.search = new URLSearchParams({latitude:spots.map(s=>s.latitude).join(','),longitude:spots.map(s=>s.longitude).join(','),current:'wind_speed_10m,wind_direction_10m',wind_speed_unit:'mph',timeformat:'unixtime',forecast_days:'1'}).toString();
      const day = shift => new Date(Date.now()+shift*86400000).toISOString().slice(0,10).replaceAll('-','');
      const tideUrl = new URL('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter');
      tideUrl.search = new URLSearchParams({product:'predictions',begin_date:day(-1),end_date:day(2),datum:'MLLW',station:'9759412',time_zone:'gmt',units:'metric',interval:'hilo',format:'json',application:'ai-studio-pet'}).toString();
      const extras = await Promise.allSettled([windUrl,tideUrl].map(async u=>{
        const r=await fetcher(u,{signal:AbortSignal.timeout(8000),redirect:'error'});
        if(!r.ok) throw Error('Supplementary forecast unavailable');
        const t=await r.text(); if(t.length>50000) throw Error('Forecast too large'); return JSON.parse(t);
      }));
      const wind = extras[0].status==='fulfilled' && Array.isArray(extras[0].value) ? extras[0].value : [];
      data.spots = data.spots.map((spot,i)=>{
        const w=wind.find((v,index)=>(v.location_id??index)===i), c=w?.current;
        const unitsOK=w?.current_units?.wind_speed_10m==='mp/h' && w?.current_units?.wind_direction_10m==='°';
        return {...spot,windMph:unitsOK?finite(c?.wind_speed_10m,0,300):null,windDirectionDegrees:unitsOK?finite(c?.wind_direction_10m,0,360):null,windSampleTime:Number.isFinite(c?.time)?c.time*1000:null};
      });
      data.tide = extras[1].status==='fulfilled' ? tideStage(extras[1].value) : null;
      data.energyMethod = 'estimated deep-water kJ per meter of wave front';
      cached = data; return cached;
    })();
    try {return await pending;} finally {pending = null;}
  };
}
