# Calibrated source and measurements

Source: PathAI / OpenSlide CC0 `Ventana-1.bif`: https://openslide.cs.cmu.edu/download/openslide-testdata/Ventana/Ventana-1.bif . All plates show the same actual specimen, registered in level-0 coordinates. No generated tissue.

Pixel scale is 0.25 µm per level-0 pixel. Full scan 24576×21504. Detail crop origin (10888,9352), size 2800×2800, width 700 µm. The whole scan export is mapped to exactly those full dimensions. Film field width = 1280 / screen pixels per level-0 pixel × 0.25 µm. Scale bars use that identical transform.

Each circle is radius 300 px = 75 µm, local centres (600,1400) and (1900,1700). Counts supplied in calibration.json: 105565/282697 =37.34%, 140446/282697 =49.68%. Rule B>1.1R, B>1.04G, B>70, within the circle. This is blue-dominant colour share of a JPEG derivative, not collagen quantification or any clinical diagnosis. The displayed mask is computed from the same JPEG at load using that rule. No nucleus size is asserted. This subject and measurement differ from the original demonstration.
