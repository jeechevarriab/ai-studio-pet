import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSurf, createSurfReader, spots, tideStage, estimatedEnergy} from '../tools/surf.mjs';
const fixture = () => spots.map((s, i) => ({location_id:i,latitude:18.54,longitude:-67.2,current_units:{wave_height:'m',wave_period:'s',wave_direction:'°'},current:{time:1793628000,wave_height:1,wave_period:8,wave_direction:18}}));
test('wave forecasts retain real grid/time provenance and missing values, never manufacture beach differences', () => {
  const rows = fixture(); rows[1].current.wave_height = null;
  const data = normalizeSurf(rows, 1000);
  assert.equal(data.spots[0].waveFeet, 3.3);
  assert.equal(data.spots[1].waveFeet, null);
  assert.equal(data.spots[2].modelLatitude, data.spots[0].modelLatitude);
  assert.equal(data.spots[0].sampleTime, 1793628000000);
  assert.equal(data.kind, 'offshore-model');
  rows[0].current_units.wave_height = 'ft'; assert.throws(() => normalizeSurf(rows));
});
test('forecast reads share a cached request and use only the fixed provider and locations', async () => {
  let calls = 0;
  const read = createSurfReader(async url => {
    calls++;
    if (url.origin === 'https://api.open-meteo.com') return {ok:true,text:async()=>JSON.stringify([])};
    if (url.origin === 'https://api.tidesandcurrents.noaa.gov') return {ok:true,text:async()=>JSON.stringify({predictions:[]})};
    assert.equal(url.origin, 'https://marine-api.open-meteo.com');
    assert.equal(url.searchParams.get('timeformat'), 'unixtime');
    assert.equal(url.searchParams.get('latitude'), spots.map(s=>s.latitude).join(','));
    return {ok:true,text:async()=>JSON.stringify(fixture())};
  });
  const [a,b] = await Promise.all([read(),read()]); assert.equal(calls,3); assert.equal(a,b);
  assert.equal(await read(),a); assert.equal(calls,3);
});
test('a provider failure is not replaced with a fabricated successful forecast', async () => {
  const read = createSurfReader(async()=>({ok:false})); await assert.rejects(read(), /unavailable/);
});
test('tide stages use bracketing UTC NOAA turning points, with a defined near-turn window', () => {
  const data={predictions:[{t:'2026-11-02 00:00',type:'L'},{t:'2026-11-02 06:00',type:'H'},{t:'2026-11-02 12:00',type:'L'}]};
  const at = h=>Date.parse(`2026-11-02T${String(h).padStart(2,'0')}:10:00Z`);
  assert.equal(tideStage(data,at(0)).stage,'Low'); assert.equal(tideStage(data,at(3)).stage,'Rising');
  assert.equal(tideStage(data,at(6)).stage,'High'); assert.equal(tideStage(data,at(9)).stage,'Falling');
  assert.equal(tideStage(data,at(18)),null); assert.equal(tideStage({predictions:[]}),null);
});
test('energy is a labeled physical estimate with missing-data handling and squared-height scaling', () => {
  assert.equal(estimatedEnergy(1,10),98); assert.equal(estimatedEnergy(2,10),392);
  assert.equal(estimatedEnergy(null,10),null); assert.equal(estimatedEnergy(1,0),null);
});
