import bpy
import sys
import os

# Получаем аргументы командной строки
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
args_dict = {args[i].lstrip('--'): args[i + 1] for i in range(0, len(args), 2)}

# Получаем пути к файлам
model_path = args_dict.get('input')
skin_path = args_dict.get('skin')
output_path = args_dict.get('output')

if not model_path or not output_path:
    raise ValueError("Не указаны обязательные параметры: --input и --output")

# Очистка сцены
bpy.ops.wm.read_factory_settings(use_empty=True)

# Определяем тип модели
file_extension = os.path.splitext(model_path)[-1].lower()

if file_extension == ".blend":
    # Открываем .blend файл
    bpy.ops.wm.open_mainfile(filepath=model_path)
    
    # Накладываем текстуру (если указана)
    if skin_path:
        if not os.path.exists(skin_path):
            raise FileNotFoundError(f"Файл текстуры не найден: {skin_path}")
        
        # Получаем первый меш
        model = next((obj for obj in bpy.context.scene.objects if obj.type == 'MESH'), None)
        if model:
            # Создаем материал
            material = bpy.data.materials.new(name="SkinMaterial")
            material.use_nodes = True
            nodes = material.node_tree.nodes
            links = material.node_tree.links
            
            # Добавляем узлы
            image_texture = nodes.new(type='ShaderNodeTexImage')
            image_texture.image = bpy.data.images.load(skin_path)
            principled_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
            material_output = nodes.new(type='ShaderNodeOutputMaterial')
            
            # Соединяем узлы
            links.new(image_texture.outputs['Color'], principled_bsdf.inputs['Base Color'])
            links.new(principled_bsdf.outputs['BSDF'], material_output.inputs['Surface'])
            
            # Применяем материал
            model.data.materials.append(material)
    
    # Экспортируем в GLB
    bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB')
    print(f"Файл сохранен: {output_path}")

elif file_extension in [".glb", ".gltf"]:
    # Просто копируем модель без изменений
    import shutil
    shutil.copy(model_path, output_path)
    print(f"GLB модель скопирована: {output_path}")

else:
    raise ValueError(f"Неподдерживаемый формат: {file_extension}")
