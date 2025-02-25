# Этап 1: Используем официальный Node.js образ для установки зависимостей
FROM node:18 AS build

# Устанавливаем pnpm
RUN npm install -g pnpm

# Указываем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости с помощью pnpm
RUN pnpm install

# Копируем все остальные файлы проекта
COPY . .

# Строим проект с помощью Vite
RUN pnpm build

# Этап 2: Используем более легкий сервер для статики
FROM nginx:alpine

# Копируем билд из первого этапа в папку для статики nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт для доступа
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
