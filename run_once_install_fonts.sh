#!/bin/bash

# Variables
URL="https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/JetBrainsMono.zip"
ZIP_FILE="JetBrainsMono.zip"
EXTRACT_DIR="JetBrainsMono"
FONTS_DIR="$HOME/.fonts/$EXTRACT_DIR"

# Descarga el archivo
echo "Descargando $ZIP_FILE..."
curl -L -o "$ZIP_FILE" "$URL"

# Crea la carpeta de descompresión si no existe
echo "Creando carpeta temporal para descomprimir: $EXTRACT_DIR"
mkdir -p "$EXTRACT_DIR"

# Descomprime el archivo
echo "Descomprimiendo $ZIP_FILE en $EXTRACT_DIR..."
unzip -o "$ZIP_FILE" -d "$EXTRACT_DIR"


# Verifica si la carpeta ya existe en ~/.fonts
if [ -d "$FONTS_DIR" ]; then
    echo "La carpeta $FONTS_DIR ya existe."
    read -p "¿Deseas sobrescribir los archivos existentes? (s/n): " CONFIRM
    if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
        echo "Operación cancelada. Limpieza de archivos temporales..."
        rm -rf "$ZIP_FILE" "$EXTRACT_DIR"
        exit 1
    fi
fi

# Crea la carpeta de fuentes si no existe
echo "Creando carpeta de fuentes: $FONTS_DIR"
mkdir -p "$FONTS_DIR"

# Mueve los archivos descomprimidos a ~/.fonts/JetBrainsMono
echo "Moviendo archivos a $FONTS_DIR..."
mv "$EXTRACT_DIR"/* "$FONTS_DIR"

# Elimina archivos temporales
echo "Limpiando archivos temporales..."
rm -rf "$ZIP_FILE" "$EXTRACT_DIR"

# Refresca la caché de fuentes
echo "Refrescando la caché de fuentes..."
fc-cache -fv

echo "Proceso completado. Las fuentes están en $FONTS_DIR"

