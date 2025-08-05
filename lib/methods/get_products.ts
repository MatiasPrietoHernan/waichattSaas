import {createClient} from '@/lib/database'
import { ProductPayload } from '../types';

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
