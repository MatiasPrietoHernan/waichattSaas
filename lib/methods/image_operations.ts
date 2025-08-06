// lib/storage/imageUpload.ts
import { createClient } from '@/lib/database'

const supabase = createClient();

export const uploadProductImages = async (files: File[], productId?: number): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const file of files) {
    try {
      // Generar un nombre único para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}_${randomString}_${file.name}`;
      const filePath = `products/${fileName}`;

      // Subir archivo al bucket
      const { data, error } = await supabase.storage
        .from('prueba') // Nombre de tu bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('prueba')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);

    } catch (error) {
      console.error('Error processing file:', file.name, error);
      throw error;
    }
  }

  return uploadedUrls;
};

export const deleteProductImages = async (imageUrls: string[]): Promise<void> => {
  for (const url of imageUrls) {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('prueba')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
      }
    } catch (error) {
      console.error('Error processing deletion for:', url, error);
    }
  }
};

export const replaceProductImages = async (
  oldImageUrls: string[], 
  newFiles: File[]
): Promise<string[]> => {
  // Eliminar imágenes antiguas
  if (oldImageUrls.length > 0) {
    await deleteProductImages(oldImageUrls);
  }
  
  // Subir nuevas imágenes
  return await uploadProductImages(newFiles);
};