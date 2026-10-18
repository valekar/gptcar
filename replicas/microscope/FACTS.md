# Measured Blue — measurement record

All imagery comes from the original PathAI Ventana-1.bif, a CC0 human liver trichrome brightfield scan hosted by the OpenSlide project. The restored source file SHA-256 is `2eb05cd8f628c36408c3fde09beeeebaaae90181c4f840d5475ec7594bdcbbb6`. Source: https://openslide.cs.cmu.edu/download/openslide-testdata/Ventana/Ventana-1.bif . Description and licence: https://openslide.cs.cmu.edu/download/openslide-testdata/Ventana/index.yaml .

Level zero is 24,576 × 21,504 pixels at 0.25 µm per pixel. The scanner photograph is registered through AOI metadata at 21.166708 µm per pixel; restored registration has a centroid error of 18.75 µm. The shared data-only preprocessing normalises the glass, adds the published density/chroma grade, feathers the scan boundary, removes scanner streaks and fills the maker's logo in the photographed slide. Specimen pixels are not invented.

The original tissue mask and PCA span are 4,799.250 µm, displayed as 4.80 mm. Circle A is centred at level-zero (8393, 13083); B at (13425, 10578). Both have a diameter of 1 mm. At level two, tissue is luminance below 200 or RGB range above 40; counted blue is tissue with B > R + 12 and B ≥ G. A contains 97,058 blue pixels among 716,763 tissue pixels (13.541%, displayed as 13.5%). B contains 232,688 among 713,354 (32.619%, displayed as 32.6%). The distance is 1,405.259 µm, displayed as 1.41 mm. The share ratio is 2.409, displayed as 2.4.

The measured nucleus centre is (13294.96699, 9266.76838) at level zero. The original radial membrane-edge fit has radius 17.04219 pixels, 67 accepted rays and 0.71797-pixel residual. Its diameter is 8.521095 µm, displayed as 8.5 µm. This is an image measurement of the stated regions under the stated threshold, not a clinical diagnosis.

The local plates.json and nucleus.json preserve the data, cumulative scan curves and coordinate transforms. asset-manifest.json records the exact derivative bytes used by this recreation. The independently applied camera produces the same fourteen pyramid transitions as the published reference, including the six-step climb.
