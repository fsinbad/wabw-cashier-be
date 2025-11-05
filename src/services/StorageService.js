import { supabase } from '../lib/supabase.js';
import InvariantError from '../exceptions/InvariantError.js';
import path from 'path';

class StorageService {
    constructor(bucketName = 'product-image') {
        this._bucketName = bucketName;
    }

    async writeFile(fileStream, meta) {
        const filename = `${Date.now()}-${meta.filename}`;

        const { error } = await supabase.storage
            .from(this._bucketName)
            .upload(filename, fileStream, {
                contentType: meta.headers['content-type'],
                upsert: false,
            });

        if (error) {
            console.error('Supabase Storage Error:', error);
            throw new InvariantError('Gagal meng-upload gambar ke Supabase.');
        }

        const { data } = supabase.storage
            .from(this._bucketName)
            .getPublicUrl(filename);

        return data.publicUrl;
    }
}

export default StorageService;