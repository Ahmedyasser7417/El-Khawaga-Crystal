// ==========================================
// Products — Supabase CRUD + Storage Upload
// Table: products (id, name, price, category_id, description, image_url, image_path, created_at)
// Storage bucket: products
// ==========================================

import { supabase } from "./supabase-config.js";
import { showToast, showSpinner, hideSpinner, confirmDelete } from "./ui.js";

const BUCKET = "products";

// ---- Fetch All ----
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// ---- Fetch Single ----
export async function getProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// ---- Upload Multiple Images to Supabase Storage ----
async function uploadImages(files) {
  const uploads = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    uploads.push({ url: data.publicUrl, path: path });
  }
  return uploads;
}

// ---- Delete Multiple Images from Storage ----
async function deleteImages(imagePaths) {
  if (!imagePaths || imagePaths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(imagePaths);
  if (error) console.error("Error deleting images:", error);
}

// ---- Add Product ----
export async function addProduct(data, imageFiles) {
  showSpinner();
  try {
    let images = [];

    if (imageFiles && imageFiles.length > 0) {
      images = await uploadImages(imageFiles);
    }

    const { error } = await supabase.from("products").insert([{
      name: data.name,
      price: data.price,
      category_id: data.categoryId,
      description: data.description || "",
      images: images,
      // Fallback for old fields
      image_url: images.length > 0 ? images[0].url : "",
      image_path: images.length > 0 ? images[0].path : "",
    }]);

    if (error) throw error;
    showToast("✅ تم إضافة المنتج بنجاح");
  } catch (e) {
    console.error(e);
    showToast("❌ حدث خطأ أثناء إضافة المنتج", "danger");
  } finally {
    hideSpinner();
  }
}

// ---- Update Product ----
export async function updateProduct(id, data, newImageFiles, imagesToDelete, keptImages) {
  showSpinner();
  try {
    if (imagesToDelete && imagesToDelete.length > 0) {
      await deleteImages(imagesToDelete);
    }

    let uploadedImages = [];
    if (newImageFiles && newImageFiles.length > 0) {
      uploadedImages = await uploadImages(newImageFiles);
    }

    const finalImages = [...(keptImages || []), ...uploadedImages];

    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        price: data.price,
        category_id: data.categoryId,
        description: data.description || "",
        images: finalImages,
        // Update fallback fields
        image_url: finalImages.length > 0 ? finalImages[0].url : "",
        image_path: finalImages.length > 0 ? finalImages[0].path : "",
      })
      .eq("id", id);

    if (error) throw error;
    showToast("✅ تم تعديل المنتج بنجاح");
  } catch (e) {
    console.error(e);
    showToast("❌ حدث خطأ أثناء التعديل", "danger");
  } finally {
    hideSpinner();
  }
}

// ---- Delete Product ----
export function deleteProduct(id, productImagesData, onSuccess) {
  confirmDelete(async () => {
    showSpinner();
    try {
      // Extract paths from productImagesData array or single string path
      const paths = [];
      if (Array.isArray(productImagesData)) {
        paths.push(...productImagesData.map(img => img.path));
      } else if (typeof productImagesData === 'string' && productImagesData) {
        paths.push(productImagesData);
      }

      if (paths.length > 0) {
        await deleteImages(paths);
      }

      // Delete record from DB
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showToast("✅ تم حذف المنتج بنجاح");
      onSuccess?.();
    } catch (e) {
      console.error(e);
      showToast("❌ حدث خطأ أثناء الحذف", "danger");
    } finally {
      hideSpinner();
    }
  });
}
