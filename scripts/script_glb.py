import bpy
import math
import sys
import os

# Устанавливаем движок рендеринга
bpy.context.scene.render.engine = 'CYCLES'

# Включаем GPU рендеринг
bpy.context.preferences.addons['cycles'].preferences.compute_device_type = 'CUDA'
bpy.context.preferences.addons['cycles'].preferences.get_devices()
for device in bpy.context.preferences.addons['cycles'].preferences.devices:
    device.use = True
bpy.context.scene.cycles.device = 'GPU'

# Extract arguments manually after '--'
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
args_dict = {args[i].lstrip('--'): args[i + 1] for i in range(0, len(args), 2)}

# Assign arguments to variables
angle_light = float(args_dict.get('angle_light', 0))
angle_vertical = float(args_dict.get('angle_vertical', 0))
angle_horizontal = float(args_dict.get('angle_horizontal', 0))
lightEnergy = float(args_dict.get('lightEnergy', 50))
output_path = args_dict.get('output')

if not output_path:
    raise ValueError("Missing required argument: --output")

# Find the first mesh in the scene
model = next((obj for obj in bpy.context.scene.objects if obj.type == 'MESH'), None)
if not model:
    raise RuntimeError("No mesh object found in the scene.")

# Rotate the model
model.rotation_euler = (0, math.radians(angle_vertical), math.radians(angle_horizontal))

# Add camera
bpy.ops.object.camera_add(location=(8, 0, 1))
camera = bpy.context.object
bpy.context.scene.camera = camera
direction = model.location - camera.location
camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

# Add light
light_radius = 8
light_x = light_radius * math.cos(math.radians(angle_light))
light_y = light_radius * math.sin(math.radians(angle_light))
light_z = 5

bpy.ops.object.light_add(type='POINT', location=(light_x, light_y, light_z))
light = bpy.context.object
light.data.energy = lightEnergy * 25
light.data.use_shadow = True

# Render output
bpy.context.scene.render.filepath = output_path
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)

print(f"Rendered image saved to {output_path}")
