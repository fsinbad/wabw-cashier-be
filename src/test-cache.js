import '@dotenvx/dotenvx/config';
import { createServer } from './server.js';

async function testServerInitialization() {
    console.log('--- SERVER INITIALIZATION TEST ---');
    console.log(`Running in [${process.env.NODE_ENV || 'development'}] mode.`);
    console.log('Attempting to initialize Hapi server with Redis cache...');

    let server;

    try {
        // Coba buat server. Jika cache gagal konek, ini akan melempar error.
        server = await createServer();
        console.log('✅ Server instance created successfully.');

        // Tes paling definitif: coba gunakan cache-nya
        await server.initialize(); // Perlu initialize sebelum bisa pakai cache
        const testCache = server.cache({ segment: 'test-segment', expiresIn: 1000 * 10 });
        await testCache.set('test-key', { value: 'it works' });
        const cachedItem = await testCache.get('test-key');

        if (cachedItem.value === 'it works') {
            console.log('✅✅✅ SUCCESS: Cache Redis is working correctly!');
        } else {
            throw new Error('Cache set/get failed.');
        }

        // Matikan server setelah selesai
        await server.stop();
        process.exit(0); // Keluar dengan kode sukses

    } catch (error) {
        console.error('❌❌❌ FAILED: Server initialization or cache test failed.');
        console.error(error);

        // Jika server sempat dibuat sebelum error, coba matikan
        if (server) {
            await server.stop();
        }
        process.exit(1); // Keluar dengan kode error
    }
}

testServerInitialization();