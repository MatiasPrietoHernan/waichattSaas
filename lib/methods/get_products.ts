import {createClient} from '@/lib/database'
import { ProductPayload } from '../types';
import { uploadProductImages,deleteProductImages  } from './image_operations';

const supabase = createClient();

export const getAllProducts = async ()=>{
    try {
        const { data, error } = await supabase
            .from('products_full_view')
            .select('*');
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Error fetching products');
    }
}

export const getProductById = async (id: string) => {
    try {
        const { data, error } = await supabase
            .from('products_full_view')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw new Error(`Error fetching product with ID ${id}`);
    }
}

export const getProductsByCategory = async (categoryId: string) => {
    try {
        const { data, error } = await supabase
            .from('products_full_view')
            .select('*')
            .eq('category_id', categoryId);
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error(`Error fetching products for category ID ${categoryId}:`, error);
        throw new Error(`Error fetching products for category ID ${categoryId}`);
    }
}

export const getSubcategory = async ()=>{
    try {
        const { data, error } = await supabase
            .from('subcategories_view')
            .select('*');
        if (error) {
            throw error;
        }
        return data;   
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        throw new Error('Error fetching subcategories');
    }
}

export const addProduct = async (product: ProductPayload) => {
    try {
        // Usa .rpc() para llamar a la función de la base de datos
        const { data, error } = await supabase.rpc('crear_producto', product);
        
        if (error) {
            throw error;
        }

        // 'data' contendrá el ID del nuevo producto que retorna la función
        // En este caso, 'data' sería un 'number' (BIGINT en la base de datos)
        console.log('Producto agregado con ID:', data);
        return data;

    } catch (error) {
        console.error('Error al agregar el producto:', error);
        throw new Error('Error al agregar el producto');
    }
};

export const deleteProduct = async (p_id: number) => {
    try {
        console.log('Deleting product with ID:', p_id);
        let { data, error } = await supabase
        .rpc('eliminar_producto', {
            p_id
        })
        if (error) console.error(error)
        else console.log(data)
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        throw new Error('Error al eliminar el producto');
    }
};

export const updateProduct = async (productData: {
  id: number;
  title?: string;
  description?: string;
  sales_price?: number;
  id_subcategory?: number;
  cost_price?: number;
  sucursal?: string;
  stock?: number;
  image_urls?: string[]; // Array de URLs
}) => {
  try {
    const { error } = await supabase.rpc('actualizar_producto', {
      producto_data: productData,
    });

    if (error) {
      throw error;
    }
    
    console.log("Producto actualizado con éxito");
    return true;

  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    throw new Error('Error al actualizar el producto');
  }
};
export const addProductWithImages = async (
  product: Omit<ProductPayload, 'p_image_urls'>,
  imageFiles: File[]
) => {
  try {
    // 1. Subir las imágenes primero
    const imageUrls = await uploadProductImages(imageFiles);
    
    // 2. Crear el producto con las URLs de las imágenes
    const productWithImages: ProductPayload = {
      ...product,
      p_image_urls: imageUrls.join(',') // Convertir array a string separado por comas
    };

    // 3. Usar la función RPC existente
    const { data, error } = await supabase.rpc('crear_producto', productWithImages);
    
    if (error) {
      // Si hay error, eliminar las imágenes subidas
      await deleteProductImages(imageUrls);
      throw error;
    }

    console.log('Producto agregado con ID:', data);
    return data;

  } catch (error) {
    console.error('Error al agregar el producto:', error);
    throw new Error('Error al agregar el producto');
  }
};

// Función actualizada para actualizar producto con imágenes
export const updateProductWithImages = async (
  productData: {
    id: number;
    title?: string;
    description?: string;
    sales_price?: number;
    id_subcategory?: number;
    cost_price?: number;
    sucursal?: string;
    stock?: number;
  },
  newImageFiles?: File[],
  keepExistingImages: boolean = false
) => {
  try {
    let imageUrls: string[] = [];
    
    // Si se proporcionan nuevas imágenes
    if (newImageFiles && newImageFiles.length > 0) {
      // Si no se mantienen las existentes, obtener las URLs actuales para eliminarlas
      if (!keepExistingImages) {
        const { data: currentProduct } = await supabase
          .from('products_full_view')
          .select('image_urls')
          .eq('id', productData.id)
          .single();

        if (currentProduct?.image_urls) {
          const oldUrls = Array.isArray(currentProduct.image_urls) 
            ? currentProduct.image_urls 
            : [currentProduct.image_urls];
          
          // Eliminar imágenes antiguas del storage
          await deleteProductImages(oldUrls);
        }
      }

      // Subir nuevas imágenes
      imageUrls = await uploadProductImages(newImageFiles);
    }

    // Preparar datos para la actualización
    const updateData = {
      ...productData,
      ...(imageUrls.length > 0 && { image_urls: imageUrls })
    };

    const { error } = await supabase.rpc('actualizar_producto', {
      producto_data: updateData,
    });

    if (error) {
      // Si hay error y se subieron imágenes, eliminarlas
      if (imageUrls.length > 0) {
        await deleteProductImages(imageUrls);
      }
      throw error;
    }
    
    console.log("Producto actualizado con éxito");
    return true;

  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    throw new Error('Error al actualizar el producto');
  }
};

// Función para eliminar producto (actualizada para eliminar imágenes del storage)
export const deleteProductWithImages = async (p_id: number) => {
  try {
    // 1. Obtener las URLs de las imágenes antes de eliminar
    const { data: product } = await supabase
      .from('products_full_view')
      .select('image_urls')
      .eq('id', p_id)
      .single();

    // 2. Eliminar el producto de la base de datos
    const { data, error } = await supabase.rpc('eliminar_producto', { p_id });
    
    if (error) {
      console.error(error);
      throw error;
    }

    // 3. Si el producto se eliminó exitosamente, eliminar las imágenes del storage
    if (product?.image_urls) {
      const imageUrls = Array.isArray(product.image_urls) 
        ? product.image_urls 
        : [product.image_urls];
      
      await deleteProductImages(imageUrls);
    }

    console.log('Producto eliminado con éxito');
    return data;

  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    throw new Error('Error al eliminar el producto');
  }
};