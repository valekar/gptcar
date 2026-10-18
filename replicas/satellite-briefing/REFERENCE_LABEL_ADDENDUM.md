# Satellite Briefing: restored inputs and reference labels

This addendum is part of the reconstruction prompt, written before the new Satellite Briefing scene implementation.

All 11 original Landsat plate acquisition sequences and their main/fill order are restored. All six main Aral sequence areas match the published source metadata exactly: 54,403.4 km² (1977), 39,859.8 (1989), 26,879.3 (2000), 14,366.3 (2009), 7,060.7 (2014), and 5,079.1 (2025). The original 68,000 km² baseline is retained. See [restoration evidence](../evidence-restoration/satellite-briefing.json).

Final decoded-movie review corrects the initial interpretation of two intermediate frames. The original percentage counter passes through 46% at 10.458 s and 25% at 11.458 s while counting down, then settles at 40% for 2000 and 21% for 2009. These agree with the exact restored source masks and the 68,000 km² baseline. There is no historical label discrepancy.

Recreate the original continuous counter interpolation and timing from the exact areas. Do not freeze intermediate values or add an explanatory footnote to the artwork. Verify consecutive frames across the counter motion and its settled state before treating a sampled number as a factual label.

The original canonical scene brief and STYLE/DEMO remain preserved. Large source caches stay private; the film credits identify the actual public source data and preprocessing.

Four close regional masks show small current preprocessing differences: Muynak 397.2→399.5 km²; Kokaral 2001 1665.8→1673.4, 2009 1884.5→1892.8, 2025 1813.0→1821.2 km². Acquisition IDs/order still match. Keep published historical measurements identified as reference values; do not describe the new mask pixels as byte-identical originals.
