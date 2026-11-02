# PLAY — Puerto Rico offshore wave forecasts

The owner explicitly requested this extension after Phase 1: replace SURF with PLAY and read public surf statistics for Wilderness Beach, Surfers Beach and Jobos Beach. The original first-milestone brief is preserved unchanged; this follow-up authorizes the forecast feature only, not studio service, account or network-exposure changes.

## Data source

[Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api) provides wave height, period and direction without a new account/key for this personal, non-commercial prototype. Attribution appears in the PLAY panel. [Windy Point Forecast](https://api.windy.com/point-forecast/docs) requires its own API key, so Windy was not connected or claimed as the source. No credentials were requested or stored. Recheck provider terms/plan before commercial use.

The names/regions are consistent with official [Puerto Rico tourism guidance](https://www.discoverpuertorico.com/es/node/811) and the [Wilderness profile](https://www.discoverpuertorico.com/es/profile/wilderness-beach-surf-spot/9465). The configured rounded coastal reference coordinates are approximate samples near those areas, not surveyed break/lineup locations or buoys:

| Label | Latitude | Longitude |
| --- | --- | --- |
| Wilderness Beach | 18.49 | -67.17 |
| Surfers Beach | 18.51 | -67.15 |
| Jobos Beach | 18.51 | -67.08 |

The API selects a sea grid cell. Its resolved model coordinates and sample timestamp are retained in the response. Nearby spots may resolve to the same cell and display equal figures; this is not measured break-specific surf height. Do not manufacture distinct forecasts, surf ratings, wind or tide values. No user GPS/location data is collected. Current conditions are model estimates, not beach observations; the UI says offshore model and shows the Puerto Rico sample time in AM/PM AST.

## Implementation and limits

The app requests `/api/surf` only when PLAY information is opened. The loopback preview server queries one fixed HTTPS provider for the three fixed points, validates units, normalizes missing values and converts meters to feet. It shares in-flight requests and caches successful data for ten minutes. No arbitrary URL, token, location or command is accepted through this route. The route is read-only. There is no scheduled polling, new background agent, public port or hub connection.

The UI displays wave height (ft), period (s), wave direction, 10 m wind speed (MPH) and direction, an estimated energy value and a regional tide stage. Provider errors produce unavailable values, not fake data. Wave/wind samples older than three hours or with invalid times show missing values. Reopening PLAY refreshes expired data. This is not a breaking-wave transformation or surf-safety/rating system.

Verification on 2026-11-02: real API responses loaded for all three configured points and appeared in the browser panel; two points shared a resolved wave cell. Wind and NOAA prediction requests also returned real data. Five isolated forecast tests cover unit/time/null normalization, fixed-provider request/cache sharing, failure handling, all four tide labels and energy scaling/missing data. All sixteen project tests passed, including the separate mascot design checks. Provider availability is not guaranteed and exact lineup accuracy has not been validated.

## Wind, energy and tide definitions

Wind comes from the [Open-Meteo weather API](https://open-meteo.com/en/docs), requested in MPH using the same approximate coastal reference points. Wind and wave models can resolve different grids. Missing/stale wind does not erase valid wave data.

Regional tide uses official [NOAA Aguadilla / Crashboat Beach station 9759412](https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9759412), verified through NOAA station metadata. UTC high/low predictions bracket the actual current time. Within 30 minutes of a turning point the UI says High or Low; otherwise the next predicted high means Rising and the next low means Falling. This 30-minute display convention is ours, not a NOAA categorical measurement. The same named regional reference serves all three rows; individual break tide offsets have not been established. No valid bracket means unavailable. Predictions are not observed water levels.

Energy is labeled `kJ/m est.`: an equivalent regular deep-water wave estimate per meter of crest width per period. Starting from the [EMSD deep-water wave power formula](https://re.emsd.gov.hk/english/other/marine/Wave_energy.html), P = rho*g²*H²*T/(32*pi), the project derives E = P*T/1000 in kJ/m, with rho=1025 kg/m³ and g=9.80665 m/s². It substitutes model significant wave height and model mean period as representative H and T. That is a simplified proxy, not a measured energy value or a calibrated irregular-wave spectrum/nearshore calculation.

This estimate does not match a proprietary spot-energy product. [Surfline's explanation](https://support.surfline.com/hc/en-us/articles/20352744481947-Wave-Energy) includes individual swell partitions and beach-relative direction/exposure; this prototype does not reproduce those adjustments. The UI uses an approximation marker and explicit per-meter units rather than claiming an absolute whole-wave kJ value. A future request to match a particular provider requires its authorized data/access and metric definition.

Additional requests stay on fixed HTTPS provider endpoints (Open-Meteo weather and NOAA predictions). Their responses are size/time bounded and failures remain independent of the wave request. No new account, paid API key, owner account data or GPS transmission is involved.
