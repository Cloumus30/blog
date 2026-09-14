import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  return mergeConfig(config, {
    build: {
      // Mencegah Vite membaca dan menghitung ukuran gzip/brotli dari seluruh 770+ chunk ke memori RAM
      reportCompressedSize: false,
      // Mematikan sourcemap untuk produksi guna menghemat alokasi memori heap
      sourcemap: false,
      // Mencegah warning overhead konsol pada chunk besar
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        // Membatasi operasi file I/O paralel agar tidak membuka terlalu banyak file descriptor dan buffer di RAM
        maxParallelFileOps: 2,
        cache: false,
      },
    },
  });
};
