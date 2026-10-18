# Satellite Briefing: restored inputs and reference labels

This addendum is part of the reconstruction prompt, written before the new Satellite Briefing scene implementation.

All 11 original Landsat plate acquisition sequences and their main/fill order are restored. All six main Aral sequence areas match the published source metadata exactly: 54,403.4 km² (1977), 39,859.8 (1989), 26,879.3 (2000), 14,366.3 (2009), 7,060.7 (2014), and 5,079.1 (2025). The original 68,000 km² baseline is retained. See [restoration evidence](../evidence-restoration/satellite-briefing.json).

The finished reference movie labels 2000 as 46% and 2009 as 25%, whereas its published source masks recompute to 40% and 21%. These are different historical source versions; the new film must not claim that its matching restored masks calculate 46% and 25%.

For visual reconstruction, retain the reference film's large labels as **46%¹** and **25%¹**, with an unobtrusive, readable footnote in those shots: “¹ Reference-film label; source-mask recalculation: 40% (2000), 21% (2009).” Preserve the original narration and overall sequence. Explain the discrepancy in FACTS.md and the gallery note too. This narrowly scoped annotation is an intentional factual-provenance deviation, not a different visual story or data subject.

The original canonical scene brief and STYLE/DEMO remain preserved. Large source caches stay private; the film credits identify the actual public source data and preprocessing.

Four close regional masks show small current preprocessing differences: Muynak 397.2→399.5 km²; Kokaral 2001 1665.8→1673.4, 2009 1884.5→1892.8, 2025 1813.0→1821.2 km². Acquisition IDs/order still match. Keep published historical measurements identified as reference values; do not describe the new mask pixels as byte-identical originals.
