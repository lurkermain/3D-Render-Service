# 3D-Render-Service
![image](https://github.com/user-attachments/assets/3ea37682-df86-49c3-b0b1-2cac871c51dc)

3D-Render-Service — это проект, предназначенный для предоставления услуг по рендерингу 3D-моделей с использованием современных технологий и инструментов.

## Структура проекта

- **Backend/**: Серверная часть приложения, реализованная на C#.
- **Frontend/**: Клиентская часть приложения, разработанная с использованием TypeScript.
- **blender_files/**: Файлы, связанные с Blender, используемые для рендеринга.
- **output/**: Директория для сохранения результатов рендеринга.
- **scripts/**: Скрипты, используемые в проекте.
- **skins/**: Файлы, относящиеся к оформлению интерфейса.

## Запуск проекта

Для запуска проекта выполните следующие шаги:

1. Настройте подключение для своей базы данных в appsettings файле путь до него Backend\Practice\appsettings.json

2. Откройте консоль или PowerShell в корневой директории проекта. Для этого в проводнике перейдите в корневую папку проекта, затем нажмите `Ctrl+Shift+ПКМ` и выберите "Открыть окно PowerShell здесь" или "Открыть консоль здесь".

3. Введите следующую команду для сборки и запуска контейнеров Docker: docker-compose up --build

Для работы со сваггером надо зайти по порту localhost:5000/swagger

## Для работы без докера
!! Проект настроен под использование контейнера в докере для 3д рендера. Для использования без докера потребуются корректировки кода

Скачайте и установите Blender с официального сайта: [Blender Download](https://www.blender.org/download/).

Убедитесь, что Blender добавлен в окружение, чтобы вы могли запускать скрипты для Blender. 

Измените класс ImageController чтобы запускать консоль локально

Пример кода

var start = new ProcessStartInfo
                {
                    FileName = blenderPath,
                    Arguments = $"-b \"{tempBlenderFilePath}\" -P \"{scriptPath}\" -- \"{tempSkinPath}\" \"{outputPath}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };
