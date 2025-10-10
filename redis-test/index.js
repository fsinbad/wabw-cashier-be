import Redis from 'ioredis';

console.log('--- MINIMAL REDIS CONNECTION TEST ---');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error('❌ FATAL: REDIS_URL environment variable is NOT SET.');
    process.exit(1);
}

console.log(`Attempting to connect to URL: ${redisUrl}`);

// Opsi koneksi, kita paksa pakai TLS, ini sering jadi masalah di cloud
const options = {
    tls: {
        rejectUnauthorized: false,
    },
    lazyConnect: true,
};

const redis = new Redis(redisUrl, options);

redis.on('connect', () => {
    console.log('✅✅✅ SUCCESS: Connected to Redis!');
    redis.ping((err, result) => {
        if (err) {
            console.error('Ping failed:', err);
        } else {
            console.log('Ping response:', result); // Harusnya 'PONG'
        }
        redis.quit();
        process.exit(0); // Keluar dengan sukses
    });
});

redis.on('error', (err) => {
    console.error('❌❌❌ FAILED: Redis connection error event:', err);
    process.exit(1); // Keluar dengan error
});

// Coba konek secara manual
redis.connect().catch((err) => {
    console.error('❌❌❌ FAILED: Manual connect() threw an error:', err);
    process.exit(1);
});