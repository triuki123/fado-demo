import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "assets" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0.0, roughness=0.5):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    metal = bsdf.inputs.get("Metallic IOR Level") or bsdf.inputs.get("Metallic")
    if metal: metal.default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return m

STONE = material("Warm architectural stone", (0.76, 0.73, 0.66), 0.02, 0.62)
WHITE = material("Warm white facade", (0.91, 0.89, 0.83), 0.03, 0.42)
GLASS = material("Curtain wall glass", (0.045, 0.18, 0.22), 0.38, 0.14)
CHARCOAL = material("Charcoal structure", (0.045, 0.06, 0.065), 0.55, 0.3)
ORANGE = material("FADO orange accent", (0.95, 0.19, 0.025), 0.08, 0.25)
GREEN = material("Landscape", (0.19, 0.42, 0.25), 0.0, 0.88)
WATER = material("Reflecting water", (0.08, 0.35, 0.42), 0.18, 0.16)

def cube(name, loc, size, mat, bevel=0.14):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = tuple(v / 2 for v in size)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new("Architectural bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    o.data.materials.append(mat)
    return o

def cyl(name, loc, radius, depth, mat, vertices=32, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    mod = o.modifiers.new("Soft edge", "BEVEL")
    mod.width = 0.09
    mod.segments = 2
    return o

def world(x, z, y=0):
    return (x, -z, y)

def pad(x, z, w, d):
    cube("Landscaped campus", world(x, z, -0.17), (w, d, 0.34), GREEN, 1.4)
    cube("Waterfront promenade", world(x, z, 0.035), (w - 1.0, d - 1.0, 0.11), STONE, 1.15)

def slab_stack(x, z, width, depth, floors, step=0.0):
    for floor in range(floors):
        ox = step * floor
        cube("Glass floor", world(x + ox, z, 0.45 + floor * 1.25), (width, depth, 1.02), GLASS, 0.28)
        cube("Floor slab", world(x + ox, z, 1.42 + floor * 1.25), (width + 0.25, depth + 0.25, 0.18), WHITE, 0.07)

# Three shared landscaped campuses; large water corridors remain open.
pad(-3, 38, 28, 14)
pad(34, 8, 22, 18)
pad(-31, -40, 28, 14)

# North technology facility: elliptical curtain wall with a finned crown.
for floor in range(3):
    cyl("Technology glass ring", world(-9, 38, 0.65 + floor * 1.35), 3.2, 1.12, GLASS, 40, (1.35, 0.72, 1))
    cyl("Technology slab", world(-9, 38, 1.27 + floor * 1.35), 3.3, 0.16, WHITE, 40, (1.38, 0.75, 1))
for angle in range(0, 360, 30):
    r = math.radians(angle)
    cube("Technology fin", world(-9 + math.cos(r)*4.45, 38 + math.sin(r)*2.42, 2.3), (0.12, 0.18, 4.35), CHARCOAL, 0.025)
cube("Technology canopy", world(-9, 34.9, 1.15), (5.8, 2.0, 0.22), ORANGE, 0.22)

# North digital commerce facility: stepped terraces and recessed glass floors.
slab_stack(5.5, 38.2, 7.8, 5.8, 2, 0.55)
cube("Commerce terrace", world(6.6, 38.2, 3.0), (6.2, 4.5, 0.3), GREEN, 0.35)
cube("Commerce cantilever", world(5.7, 34.8, 2.1), (8.6, 1.4, 0.28), ORANGE, 0.2)
for x in [2.2, 4.5, 6.8, 9.1]:
    cube("Commerce louver", world(x, 35.35, 1.45), (0.11, 0.18, 2.5), CHARCOAL, 0.02)

# East customer experience center: curved low pavilion and reflecting pool.
cyl("Experience pavilion", world(29.5, 5.0, 1.0), 3.8, 1.75, GLASS, 48, (1.35, 0.75, 1))
cyl("Experience roof", world(29.5, 5.0, 1.92), 4.15, 0.22, WHITE, 48, (1.4, 0.8, 1))
cube("Experience entry", world(29.5, 1.9, 1.12), (5.2, 1.6, 0.24), ORANGE, 0.28)
cyl("Reflecting pool", world(29.5, 11.3, 0.16), 2.35, 0.08, WATER, 48, (1.65, 0.72, 1))

# East partner/training center: U-shaped wings around a planted courtyard.
cube("Training west wing", world(37.4, 7.4, 1.45), (3.0, 6.8, 2.7), WHITE, 0.42)
cube("Training east wing", world(42.3, 7.4, 1.45), (3.0, 6.8, 2.7), WHITE, 0.42)
cube("Training bridge", world(39.85, 10.25, 2.35), (7.8, 1.25, 1.15), GLASS, 0.3)
cube("Training courtyard", world(39.85, 6.8, 0.16), (3.7, 4.2, 0.12), GREEN, 0.55)
cube("Training canopy", world(39.85, 3.5, 1.2), (6.6, 1.25, 0.22), ORANGE, 0.2)

# Southwest international office: restrained vertical landmark below HQ height.
slab_stack(-37.5, -40, 5.8, 5.2, 4, -0.12)
for x in [-40.45, -34.55]:
    cube("Trade vertical frame", world(x, -40, 2.75), (0.18, 5.45, 5.4), CHARCOAL, 0.04)
cube("Trade entrance", world(-37.5, -36.8, 1.05), (4.6, 1.6, 0.22), ORANGE, 0.18)

# Southwest logistics office: industrial-modern sawtooth silhouette.
cube("Logistics office", world(-24.5, -40, 1.35), (8.5, 6.2, 2.55), WHITE, 0.35)
for x in [-27.2, -24.5, -21.8]:
    cube("Logistics roof monitor", world(x, -40, 3.0), (2.1, 4.8, 0.65), GLASS, 0.18).rotation_euler[1] = math.radians(12)
cube("Logistics canopy", world(-24.5, -36.6, 1.35), (7.8, 1.4, 0.25), ORANGE, 0.18)
for x in [-27.3, -25.45, -23.6, -21.75]:
    cube("Logistics facade bay", world(x, -36.92, 1.25), (1.45, 0.12, 1.65), GLASS, 0.05)

# Central plaza creates a public focal point without occupying much water.
cyl("Central plaza", world(-7, 0, 0.04), 5.0, 0.22, STONE, 48, (1.35, 0.8, 1))
cyl("Central lawn", world(-7, 0, 0.17), 3.35, 0.08, GREEN, 48, (1.25, 0.72, 1))
cyl("FADO sculpture base", world(-7, 0, 0.48), 0.75, 0.72, CHARCOAL, 32)
for angle in [-22, 22]:
    p = cube("FADO sculpture", world(-7, 0, 2.1), (0.24, 0.5, 3.2), ORANGE, 0.05)
    p.rotation_euler[1] = math.radians(angle)

# Benches and low architectural lights establish human scale.
for x, z in [(-5,35), (1,35), (27,13), (36,15), (-33,-36), (-27,-36), (-11,0), (-3,0)]:
    cube("Campus bench", world(x, z, 0.38), (1.6, 0.48, 0.18), CHARCOAL, 0.06)
    cube("Bench support", world(x, z, 0.18), (1.15, 0.3, 0.35), STONE, 0.05)

# Save an editable source, then flatten runtime geometry to one batch/material.
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(MODEL_DIR / "fado_ecosystem_source.blend"))
for obj in list(bpy.context.scene.objects):
    if obj.type != "MESH": continue
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for modifier in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(False)
for mat in [STONE, WHITE, GLASS, CHARCOAL, ORANGE, GREEN, WATER]:
    objects = [o for o in bpy.context.scene.objects if o.type == "MESH" and o.data.materials and o.data.materials[0] == mat]
    if not objects: continue
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1: bpy.ops.object.join()
    objects[0].name = f"ECOSYSTEM_BATCH_{mat.name}"
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=str(MODEL_DIR / "fado_ecosystem.glb"), export_format="GLB", use_selection=False, export_apply=True, export_materials="EXPORT", export_yup=True)
print("Exported FADO ecosystem campus")
