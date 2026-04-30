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

// ---- Upload Image to Supabase Storage ----
async function uploadImage(file) {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { imageUrl: data.publicUrl, imagePath: path };
}

// ---- Delete Image from Storage ----
async function deleteImage(imagePath) {
  if (!imagePath) return;
  await supabase.storage.from(BUCKET).remove([imagePath]);
}

// ---- Add Product ----
export async function addProduct(data, imageFile) {
  showSpinner();
  try {
    let imageUrl = "";
    let imagePath = "";

    if (imageFile) {
      const uploaded = await uploadImage(imageFile);
      imageUrl = uploaded.imageUrl;
      imagePath = uploaded.imagePath;
    }

    const { error } = await supabase.from("products").insert([{
      name: data.name,
      price: data.price,
      category_id: data.categoryId,
      description: data.description || "",
      image_url: imageUrl,
      image_path: imagePath,
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
export async function updateProduct(id, data, imageFile, oldImagePath) {
  showSpinner();
  try {
    let imageUrl = data.imageUrl || "";
    let imagePath = oldImagePath || "";

    if (imageFile) {
      // Delete old image first
      await deleteImage(oldImagePath);
      // Upload new image
      const uploaded = await uploadImage(imageFile);
      imageUrl = uploaded.imageUrl;
      imagePath = uploaded.imagePath;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        price: data.price,
        category_id: data.categoryId,
        description: data.description || "",
        image_url: imageUrl,
        image_path: imagePath,
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
export function deleteProduct(id, imagePath, onSuccess) {
  confirmDelete(async () => {
    showSpinner();
    try {
      // Delete image from storage
      await deleteImage(imagePath);

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
