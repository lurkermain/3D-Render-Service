import bpy
import sys
import os

# Получаем аргументы командной строки
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
args_dict = {args[i].lstrip("--"): args[i + 1] for i in range(0, len(args), 2)}

# Пути к файлам
skin_path = args_dict.get("skin")
output_path = args_dict.get("output")

# Проверяем наличие файлов
if not os.path.exists(skin_path):
    raise FileNotFoundError(f"Файл скина не найден: {skin_path}")

# Загружаем сцену
bpy.ops.wm.open_mainfile(filepath=bpy.data.filepath)

# Находим объект (предполагаем, что он один)
obj = next((o for o in bpy.context.scene.objects if o.type == "MESH"), None)
if not obj:
    raise RuntimeError("Объект не найден в сцене!")

# Применяем скин
material = bpy.data.materials.new(name="SkinMaterial")
material.use_nodes = True

tex_image = material.node_tree.nodes.new("ShaderNodeTexImage")
tex_image.image = bpy.data.images.load(skin_path)

bsdf = material.node_tree.nodes.get("Principled BSDF")
material.node_tree.links.new(tex_image.outputs["Color"], bsdf.inputs["Base Color"])

if obj.data.materials:
    obj.data.materials[0] = material
else:
    obj.data.materials.append(material)

# Экспортируем в GLB
bpy.ops.export_scene.gltf(filepath=output_path, export_format="GLB")

print(f"Модель сохранена в {output_path}")
