# Immagine base Node
FROM node:20-slim

# Cartella di lavoro dentro il container
WORKDIR /usr/src/app

# Copio solo package*.json per installare le dipendenze
COPY package*.json ./

# Installo dipendenze (solo produzione)
RUN npm install --only=production

# Copio il resto del codice
COPY . .

# Porta su cui ascolta l'app
ENV PORT=8080
EXPOSE 8080

# Comando di avvio
CMD ["npm", "start"]