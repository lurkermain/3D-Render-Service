FROM linuxserver/blender:latest

# Устанавливаем зависимости для работы с GPU
RUN apt update && apt install -y \
    nvidia-cuda-toolkit \
    nvidia-driver-535 && \
    rm -rf /var/lib/apt/lists/*

# Устанавливаем NVIDIA Container Toolkit
RUN curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg && \
    curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | tee /etc/apt/sources.list.d/nvidia-container-toolkit.list && \
    apt update && apt install -y nvidia-container-toolkit && \
    rm -rf /var/lib/apt/lists/*

# Копируем файлы
WORKDIR /app
COPY blender_files /app/blender_files
COPY scripts /app/scripts
COPY skins /app/skins
COPY output /app/output

# Устанавливаем GPU-рендеринг по умолчанию
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=all