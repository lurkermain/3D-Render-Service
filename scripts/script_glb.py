import bpy
import math
import os
import sys

# Очистка сцены
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

# Проверяем, доступен ли аддон
import addon_utils
addon_utils.enable("io_scene_gltf", default_set=True, persistent=True)

# Устанавливаем движок рендеринга
bpy.context.scene.render.engine = 'CYCLES'

# Включаем GPU рендеринг
bpy.context.preferences.addons['cycles'].preferences.compute_device_type = 'CUDA'
bpy.context.preferences.addons['cycles'].preferences.get_devices()
for device in bpy.context.preferences.addons['cycles'].preferences.devices:
    device.use = True
bpy.context.scene.cycles.device = 'GPU'

# Извлечение аргументов командной строки
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
args_dict = {args[i].lstrip('--'): args[i + 1] for i in range(0, len(args), 2)}

# Назначение аргументов
model_path = args_dict.get('input')
output_path = args_dict.get('output')
angle_light = math.radians(float(args_dict.get('angle_light', 0)))
angle_vertical = math.radians(float(args_dict.get('angle_vertical', 0)))
angle_horizontal = math.radians(float(args_dict.get('angle_horizontal', 0)))
lightEnergy = float(args_dict.get('lightEnergy', 50))

if not model_path or not output_path:
    raise ValueError("Отсутствует обязательный аргумент: --input или --output")

# Импорт модели
if model_path.endswith(".glb") or model_path.endswith(".gltf"):
    bpy.ops.import_scene.gltf(filepath=model_path)
elif model_path.endswith(".blend"):
    bpy.ops.wm.open_mainfile(filepath=model_path)
else:
    raise ValueError(f"Неподдерживаемый формат файла: {model_path}")

# Находим первый меш в сцене
model = next((obj for obj in bpy.context.scene.objects if obj.type == 'MESH'), None)
if not model:
    raise RuntimeError("Меш объект не найден в сцене.")

# Масштабируем модель до стандартного размера
scale_factor = 1.0 / max(model.dimensions)  # Нормализуем по максимальному размеру
model.scale = (scale_factor, scale_factor, scale_factor)

# Применяем трансформации
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Устанавливаем положение модели
bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS')
model.location = (0, 0, 0.5)

# Вращаем модель
bpy.ops.transform.rotate(value=angle_vertical, orient_axis='Y')
bpy.ops.transform.rotate(value=angle_horizontal, orient_axis='Z')

# Настройки рендеринга
bpy.context.scene.cycles.samples = 4
bpy.context.scene.cycles.use_adaptive_sampling = False
bpy.context.scene.cycles.use_denoising = False
bpy.context.scene.cycles.use_fast_gi = False
bpy.context.scene.render.resolution_x = 1024
bpy.context.scene.render.resolution_y = 1024
bpy.context.scene.render.resolution_percentage = 100

# Добавление камеры
bpy.ops.object.camera_add(location=(3, 0, 1))
camera = bpy.context.object
bpy.context.scene.camera = camera
direction = model.location - camera.location
camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

# Добавление света
light_radius = 5
light_x = light_radius * math.cos(math.radians(angle_light))
light_y = light_radius * math.sin(math.radians(angle_light))
light_z = 0.5

bpy.ops.object.light_add(type='POINT', location=(light_x, light_y, light_z))
light = bpy.context.object
light.data.energy = lightEnergy * 25
light.data.use_shadow = True

# Сохранение рендера
bpy.context.scene.render.filepath = output_path
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)

print(f"Rendered image saved to {output_path}")
