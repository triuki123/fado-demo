import bpy
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "models" / "fado_truck.glb"
OUT.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

def mat(name, color, metallic=0.0, roughness=0.45):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    metallic_input = bsdf.inputs.get("Metallic IOR Level") or bsdf.inputs.get("Metallic")
    if metallic_input:
        metallic_input.default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return material

WHITE = mat("Body White", (0.88, 0.9, 0.88), 0.12, 0.25)
ORANGE = mat("FADO Orange", (0.95, 0.18, 0.025), 0.1, 0.23)
DARK = mat("Chassis", (0.025, 0.035, 0.045), 0.45, 0.33)
GLASS = mat("Automotive Glass", (0.025, 0.12, 0.17), 0.35, 0.12)
TIRE = mat("Tire Rubber", (0.012, 0.014, 0.016), 0.0, 0.88)
METAL = mat("Wheel Metal", (0.32, 0.36, 0.38), 0.82, 0.24)
LIGHT = mat("Lamp", (1.0, 0.76, 0.35), 0.05, 0.16)

def cube(name, location, scale, material, bevel=0.06):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0] / 2, scale[1] / 2, scale[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Manufactured edge bevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3
    obj.data.materials.append(material)
    return obj

def cylinder(name, location, radius, depth, material, vertices=32, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    bevel = obj.modifiers.new("Edge bevel", "BEVEL")
    bevel.width = min(radius * 0.12, 0.035)
    bevel.segments = 2
    return obj

cube("Chassis", (0, 0.0, 0.48), (1.52, 4.45, 0.22), DARK, 0.05)
cube("Cargo body", (0, 0.45, 1.48), (1.72, 3.05, 1.86), ORANGE, 0.11)
cube("Cargo lower rail", (0, 0.45, 0.62), (1.8, 3.12, 0.14), DARK, 0.025)
for y in [-0.92, -0.3, 0.32, 0.94, 1.56]:
    cube("Cargo panel seam", (0.866, y, 1.48), (0.028, 0.035, 1.56), METAL, 0.008)
cube("Cab lower", (0, -1.78, 0.95), (1.68, 1.25, 0.92), WHITE, 0.13)
cab_upper = cube("Cab upper", (0, -1.7, 1.63), (1.56, 1.02, 0.72), WHITE, 0.16)
cab_upper.rotation_euler.x = math.radians(-7)
cube("Windshield", (0, -2.225, 1.68), (1.22, 0.035, 0.47), GLASS, 0.055)
for x in [-0.796, 0.796]:
    cube("Side window", (x, -1.78, 1.62), (0.035, 0.58, 0.42), GLASS, 0.04)
    cube("Mirror arm", (x * 1.08, -2.02, 1.47), (0.06, 0.3, 0.06), DARK, 0.015)
    cube("Mirror", (x * 1.14, -2.17, 1.47), (0.11, 0.06, 0.2), DARK, 0.035)
cube("Front grille", (0, -2.43, 0.91), (0.92, 0.045, 0.3), DARK, 0.025)
cube("Front bumper", (0, -2.47, 0.55), (1.66, 0.13, 0.18), METAL, 0.035)
for x in [-0.57, 0.57]:
    cube("Headlight", (x, -2.49, 1.12), (0.27, 0.04, 0.16), LIGHT, 0.04)
for x in [-0.86, 0.86]:
    for y in [-1.72, 1.18]:
        cylinder("Tire", (x, y, 0.5), 0.39, 0.22, TIRE, rotation=(0, math.pi / 2, 0))
        cylinder("Rim", (x * 1.005, y, 0.5), 0.19, 0.235, METAL, rotation=(0, math.pi / 2, 0))
cube("Rear door", (0, 1.99, 1.47), (1.52, 0.05, 1.62), WHITE, 0.035)
for x in [-0.52, 0.52]:
    cylinder("Door locking bar", (x, 2.025, 1.48), 0.025, 1.42, METAL)
for z in [0.82, 1.5, 2.14]:
    for x in [-0.71, 0.71]:
        cube("Door hinge", (x, 2.055, z), (0.12, 0.05, 0.07), DARK, 0.015)

bpy.ops.object.select_all(action="SELECT")
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / "assets" / "models" / "fado_truck_source.blend"))
bpy.ops.export_scene.gltf(filepath=str(OUT), export_format="GLB", use_selection=False, export_apply=True, export_materials="EXPORT", export_yup=True)
print(f"Exported {OUT}")
