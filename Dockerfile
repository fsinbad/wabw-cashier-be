# --- TAHAP 1: BUILDER ---
# Tahap ini untuk menginstal semua dependensi dan menyalin source code
FROM node:18-alpine AS builder

# Tentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json terlebih dahulu untuk optimasi cache
COPY package*.json ./

# Instal semua dependensi (termasuk devDependencies jika ada proses build)
RUN npm install

# Salin sisa source code aplikasi
COPY . .

# --- TAHAP 2: RUNNER (PRODUKSI) ---
# Mulai lagi dari image Node.js yang bersih untuk image final yang ramping
FROM node:18-alpine

WORKDIR /usr/src/app

# Set environment ke production, ini adalah best practice
ENV NODE_ENV=production

# Salin package.json dan package-lock.json lagi
COPY package*.json ./

# Instal HANYA dependensi produksi untuk menjaga image tetap kecil
RUN npm install --omit=dev

# Salin hanya file-file yang dibutuhkan untuk produksi dari tahap 'builder'
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/migrations ./migrations
# Salin file terenkripsi Anda (sesuai alur kerja dotenvx terbaru)
COPY --from=builder /usr/src/app/.env.production ./.env.production
COPY --from=builder /usr/src/app/.env.example ./.env.example

# Best practice keamanan: Jalankan aplikasi sebagai user non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Ekspos port yang akan digunakan oleh aplikasi. Railway akan memetakannya secara dinamis.
EXPOSE 3000

# Perintah untuk menjalankan aplikasi. Ini akan memanggil skrip "start" di package.json
CMD [ "npm", "start" ]