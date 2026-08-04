import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

const PROFILE_PHOTO_FOLDER = 'applyze/profile-photos';

export function generatePhotoUploadSignature() {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder: PROFILE_PHOTO_FOLDER };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

    return {
        signature,
        timestamp,
        apiKey: env.CLOUDINARY_API_KEY,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        folder: PROFILE_PHOTO_FOLDER,
    };
}
