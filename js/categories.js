// ==========================================
// Categories — Supabase CRUD
// Table: categories (id, name, created_at)
// ==========================================

import { supabase } from "./supabase-config.js";
import { showToast, showSpinner, hideSpinner, confirmDelete } from "./ui.js";

// ---- Fetch All ----
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// ---- Add ----
export async function addCategory(name) {
  showSpinner();
  try {
    const { error } = await supabase
      .from("categories")
      .insert([{ name }]);

    if (error) throw error;
    showToast("✅ تم إضافة التصنيف بنجاح");
  } catch (e) {
    console.error(e);
    showToast("❌ حدث خطأ أثناء الإضافة", "danger");
  } finally {
    hideSpinner();
  }
}

// ---- Update ----
export async function updateCategory(id, name) {
  showSpinner();
  try {
    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id);

    if (error) throw error;
    showToast("✅ تم تعديل التصنيف بنجاح");
  } catch (e) {
    console.error(e);
    showToast("❌ حدث خطأ أثناء التعديل", "danger");
  } finally {
    hideSpinner();
  }
}

// ---- Delete ----
export function deleteCategory(id, onSuccess) {
  confirmDelete(async () => {
    showSpinner();
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showToast("✅ تم حذف التصنيف بنجاح");
      onSuccess?.();
    } catch (e) {
      console.error(e);
      showToast("❌ حدث خطأ أثناء الحذف", "danger");
    } finally {
      hideSpinner();
    }
  });
}

// ---- Populate select dropdowns ----
export async function populateCategorySelects(...selectIds) {
  const cats = await getCategories();
  selectIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const current = el.value;
    el.innerHTML = `<option value="">-- اختر التصنيف --</option>`;
    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === current) opt.selected = true;
      el.appendChild(opt);
    });
  });
  return cats;
}
