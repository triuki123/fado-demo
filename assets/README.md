# Environment lighting asset

`kloppenheim_03_puresky_1k.hdr` is the 1K HDR version of **Kloppenheim 03 (Pure Sky)** by Greg Zaal and Jarod Guest, downloaded from [Poly Haven](https://polyhaven.com/a/kloppenheim_03_puresky).

License: CC0. The HDRI is used only for image-based lighting and material reflections; the website keeps its existing background, world layout and camera composition.

## Blender models

`models/fado_truck.glb` is generated locally from
`scripts/blender/create_fado_truck.py`. The source `.blend` is retained so the
model can be refined in Blender and exported again without changing Three.js
anchors or vehicle animation code.

`models/fado_ecosystem.glb` and its editable
`models/fado_ecosystem_source.blend` contain the six supporting facilities,
three landscaped campus zones and central plaza. The runtime GLB is merged by
material to keep the expanded aerial scene efficient.
