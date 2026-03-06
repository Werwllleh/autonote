import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

@Injectable()
export class UploadService {
  async processImage(
    file: Express.Multer.File,
    folder: string,
    maxWidth = 800,
  ): Promise<string> {
    const dir = path.join(UPLOADS_DIR, folder);
    await fs.mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    const filepath = path.join(dir, filename);

    await sharp(file.buffer)
      .resize(maxWidth, maxWidth, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);

    return `/uploads/${folder}/${filename}`;
  }

  async removeImage(url: string): Promise<void> {
    if (!url) return;
    const filepath = path.join(UPLOADS_DIR, url.replace('/uploads/', ''));
    await fs.unlink(filepath).catch(() => {});
  }
}
