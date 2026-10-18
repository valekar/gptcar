# Facts and original data provenance

This reconstruction uses the same preserved IRENA (2026) / Our World in Data World series, 2014–2025, as the original film. Solar includes photovoltaic and concentrated solar, on/off-grid. Wind includes onshore and offshore, on/off-grid. Unit: cumulative installed capacity, GW. Original archived CSVs and metadata are copied byte-for-byte into data/. They are not a newer live-data substitution.

Sources: [solar capacity](https://ourworldindata.org/grapher/installed-solar-pv-capacity), [wind capacity](https://ourworldindata.org/grapher/cumulative-installed-wind-energy-capacity-gigawatts). IRENA (2026), processed by Our World in Data, CC BY 4.0.

| Year | Solar GW | Wind GW | Solar plates | Wind plates |
|---|---:|---:|---:|---:|
| 2014 | 178.84773 | 349.49323 | 18 | 35 |
| 2015 | 226.5979 | 416.38437 | 23 | 42 |
| 2016 | 298.50723 | 467.3158 | 30 | 47 |
| 2017 | 392.3427 | 514.97186 | 39 | 51 |
| 2018 | 487.84647 | 563.5159 | 49 | 56 |
| 2019 | 590.1197 | 623.076 | 59 | 62 |
| 2020 | 721.2222 | 733.2712 | 72 | 73 |
| 2021 | 865.921 | 824.1905 | 87 | 82 |
| 2022 | 1057.8683 | 903.0115 | 106 | 90 |
| 2023 | 1423.988 | 1018.3177 | 142 | 102 |
| 2024 | 1883.1776 | 1132.5869 | 188 | 113 |
| 2025 | 2396.7092 | 1291.015 | 240 | 129 |

All plates, including brass ruler plates, represent the same 10 GW unit. Each tenth piece is brass, marking each completed 100 GW. The original spoken wording “Every brass plate, one hundred” and on-screen “黄铜 =100 GW” are retained as the ruler-marker wording, rather than treating brass as an extra 100 GW piece. Counts are rounded to nearest whole plate; numerical labels show the original values to one decimal. Rounding error is less than 5 GW.

2014 ratio: 349.49323 ÷ 178.84773 = 1.954138473, displayed ×1.95. In 2020 solar 721.2222 < wind 733.2712; in 2021 solar 865.921 > wind 824.1905. The four readings hold together before the crossover verdict.

2025 solar increase: 2396.7092 − 1883.1776 = 513.5316000 GW, displayed +513.5 GW. This is the difference of two cumulative values, not a separate IRENA additions table. Count increase:240−188=52 plates. Counter interpolation uses the number of landed new plates /52 and reaches 2396.7092 on the final landing at 29.2325 seconds.

2025 solar/wind ratio: 2396.7092 ÷ 1291.015 = 1.856453411, engraved/displayed ×1.86. There are twelve years and 1935 plates total across both series. The geometric unit is 0.50×0.42×0.0125, with a 0.985 thickness factor for a hairline gap. The final object is a radius 0.64 brass puck.

Exact input hashes:
- `owid_solar_capacity.metadata.json`: SHA-256 `fc9c1e629b9c9e0df1a2172f4ef7884b773a6b13b2290d605d72aea7a3e04171`.
- `owid_wind_capacity.metadata.json`: SHA-256 `876558b0c9ce2f8bc7400a7b01b94458608c7ec836ad63e0e92cc07536993b4d`.
- `world_solar_capacity_irena2026.csv`: SHA-256 `76123dcb87b300bac1d8462e4d663a0d837751d053171cd73862cb7ace63e187`.
- `world_wind_capacity_irena2026.csv`: SHA-256 `bf7493538369a57391406b7868d1f0c20b2b0c9502e3bd40bef031a40daa4ad4`.
