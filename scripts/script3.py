import bpy
import math
import sys
import os

# Устанавливаем движок рендеринга
bpy.context.scene.render.engine = 'CYCLES'

# Включаем GPU рендеринг
bpy.context.preferences.addons['cycles'].preferences.compute_device_type = 'OPTIX'  # Или 'OPTIX' для новых карт

# Включаем все доступные CUDA-устройства
bpy.context.preferences.addons['cycles'].preferences.get_devices()
for device in bpy.context.preferences.addons['cycles'].preferences.devices:
    device.use = True

# Переключаем рендер на GPU
bpy.context.scene.cycles.device = 'GPU'

# Debug: Print all received arguments
print("Received arguments:", sys.argv)

# Extract arguments manually after '--'
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []

# Convert arguments into a dictionary
args_dict = {}
for i in range(0, len(args), 2):
    key = args[i].lstrip('--')
    value = args[i + 1] if i + 1 < len(args) else None
    args_dict[key] = value

# Debug: Print parsed arguments
print(f"Parsed arguments: {args_dict}")

# Assign arguments to variables
angle_light = float(args_dict.get('angle_light', 0))
angle_vertical = float(args_dict.get('angle_vertical', 0))
angle_horizontal = float(args_dict.get('angle_horizontal', 0))
lightEnergy = float(args_dict.get('lightEnergy', 50))
texture_path = args_dict.get('skin')
output_path = args_dict.get('output')

# Validate required arguments
if not texture_path or not output_path:
    raise ValueError("Missing required arguments: --skin and --output")

# Debug: Print final argument values
print(f"angle_light={angle_light}, angle_vertical={angle_vertical}, angle_horizontal={angle_horizontal}, lightEnergy={lightEnergy}")
print(f"texture_path={texture_path}, output_path={output_path}")

# Verify paths
if not os.path.exists(texture_path):
    raise FileNotFoundError(f"Texture file not found: {texture_path}")
if not os.path.exists(os.path.dirname(output_path)):
    raise FileNotFoundError(f"Output directory does not exist: {os.path.dirname(output_path)}")

# Find the first mesh in the scene
model = next((obj for obj in bpy.context.scene.objects if obj.type == 'MESH'), None)
if not model:
    raise RuntimeError("No mesh object found in the scene.")

# Debug: Print model name
print(f"Using model: {model.name}")

# Rendering settings
bpy.context.scene.cycles.samples = 1
bpy.context.scene.cycles.use_adaptive_sampling = False
bpy.context.scene.cycles.use_denoising = False
bpy.context.scene.cycles.use_fast_gi = False
bpy.context.scene.render.resolution_x = 1024
bpy.context.scene.render.resolution_y = 1024
bpy.context.scene.render.resolution_percentage = 100

# Rotate the model
model.rotation_euler = (0, math.radians(angle_vertical), math.radians(angle_horizontal))

# Apply texture
material = bpy.data.materials.new(name="CustomMaterial")
material.use_nodes = True

nodes = material.node_tree.nodes
links = material.node_tree.links

for node in nodes:
    nodes.remove(node)

image_texture = nodes.new(type='ShaderNodeTexImage')
image_texture.image = bpy.data.images.load(texture_path)

principled_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
material_output = nodes.new(type='ShaderNodeOutputMaterial')

links.new(image_texture.outputs['Color'], principled_bsdf.inputs['Base Color'])
links.new(principled_bsdf.outputs['BSDF'], material_output.inputs['Surface'])

if model.data.materials:
    model.data.materials[0] = material
else:
    model.data.materials.append(material)

# Делаем сцену активной
bpy.context.view_layer.objects.active = None
bpy.ops.object.select_all(action='DESELECT')

# Add camera
camera_location = (8, 0, 1)
bpy.ops.object.camera_add(location=camera_location)
camera = bpy.context.object
bpy.context.scene.camera = camera
direction = model.location - camera.location
camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

# Add light
light_radius = 8
light_x = light_radius * math.cos(math.radians(angle_light))
light_y = light_radius * math.sin(math.radians(angle_light))
light_z = 5

# Делаем сцену активной
bpy.context.view_layer.objects.active = None
bpy.ops.object.select_all(action='DESELECT')

bpy.ops.object.light_add(type='POINT', location=(light_x, light_y, light_z))
light = bpy.context.object
light.data.energy = lightEnergy * 25
light.data.use_shadow = True

print(f"Rendering to: {output_path}")

# Render output
bpy.context.scene.render.filepath = output_path
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)

print(f"Rendered image saved to {output_path}")
