import { supabase } from '../lib/supabaseConf.js';
import InvariantError from '../exceptions/InvariantError.js';

class StorageService {
    constructor() {
        this._bucketName = 'product-images';
    }

    async writeFile(fileStream, meta) {
        const filename = `${+new Date()}-${meta.filename}`;
        const { error } = await supabase.storage
            .from(this._bucketName)
            .upload(filename, fileStream, {
                contentType: meta.headers['content-type'],
                upsert: false,
            });

        if (error) {
            console.error('Supabase Storage Error:', error);
            throw new InvariantError('Gagal meng-upload gambar.');
        }

        const { data } = supabase.storage
            .from(this._bucketName)
            .getPublicUrl(filename);

        return data.publicUrl;
    }
}

export default StorageService;