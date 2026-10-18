# Real calibrated microscopy assets

{
  "source": "https://openslide.cs.cmu.edu/download/openslide-testdata/Ventana/Ventana-1.bif",
  "credit": "PathAI / OpenSlide",
  "license": "CC0-1.0",
  "scan_resolution_um_per_pixel": 0.25,
  "full_resolution_dimensions_px": [
    24576,
    21504
  ],
  "detail_crop_level0_xywh": [
    10888,
    9352,
    2800,
    2800
  ],
  "detail_um_per_pixel": 0.25,
  "detail_field_width_um": 700,
  "pyramid_5_original_dimensions": [
    3072,
    2688
  ],
  "pyramid_5_export_dimensions": [
    3000,
    2625
  ],
  "pyramid_5_export_um_per_pixel": 2.048,
  "pyramid_6_export_dimensions": [
    1536,
    1344
  ],
  "pyramid_6_export_um_per_pixel": 4,
  "roi_measurements": [
    {
      "center_px": [
        600,
        1400
      ],
      "radius_px": 300,
      "radius_um": 75,
      "total_pixels": 282697,
      "blue_pixels": 105565,
      "blue_fraction_percent": 37.34
    },
    {
      "center_px": [
        1900,
        1700
      ],
      "radius_px": 300,
      "radius_um": 75,
      "total_pixels": 282697,
      "blue_pixels": 140446,
      "blue_fraction_percent": 49.68
    }
  ],
  "measurement_note": "Blue-dominant pixel share in JPEG derivative, not a clinical collagen diagnosis. Threshold B>1.1R, B>1.04G, B>70, circular300px masks; all imagecoords relative to2800x2800detailcrop."
}

Usepyramid-6.jpg(wholeScan,4um/px),pyramid-5.jpg(wholeScan,2.048um/px),tissue-detail.jpg(center2800pxcrop,0.25um/px). Exactregistered detailcrop isstoredin calibration.json. Real scan, no invented tissue. Avoid showing the original slide label; only tissue-derived plates wereexported. Parentvisually inspectedactual tissue detail. CC0license from source-index.yaml. Fieldwidthofdetail700um; masksradius75um. Do not carryoverdemo13.5%/32.6% values; use actual derivative measured fractions recordedhere.
