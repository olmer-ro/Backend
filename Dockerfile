# Use la imagen oficial de Node.js como base
FROM node:20

# Setea el directorio de trabajo
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package.json package-lock.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente al contenedor
COPY . .

# Expone el puerto que usa la API (puedes cambiar este puerto si es necesario)
EXPOSE 3001

# Comando para iniciar el servidor de Express
CMD ["npm", "start"]