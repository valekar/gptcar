# Real returns and derived surface

USGS 3DEP, `USGS_LPC_CT_Statewide_B8_2016`, public domain. Source https://s3-us-west-2.amazonaws.com/usgs-lidar-public/USGS_LPC_CT_Statewide_B8_2016/ept.json . Exact EPT nodes, position transforms and source metadata are retained in assets/points.json. Local east/north positions are approximate Web Mercator offsets times cos(latitude), original elevations minus ground_reference_m 181.62 m. Positions stay fixed throughout.

Point count and class-2 count are computed from the supplied file. Class 1 is provider-unclassified, never asserted to be canopy. Surface: 76×76 samples over -405…405 m, each uses the nearest actual provider-class-2 return, using scipy.spatial.cKDTree. Original samples, no invented archaeological features or surface sculpting, no relief exaggeration. The surface is explicitly labelled interpolation and is a coarse preview. No stone-wall network length is claimed; this is a different Ashford-area window from the original film. See assets/ground-grid.json for computed counts and nearest-sample distances.

Visual legibility pass: point sprites use a small screen-space minimum and correct linear-to-display colour conversion; this changes neither return positions, classification, counts nor surface samples. Points ahead of the scanning front remain a dim context layer.
