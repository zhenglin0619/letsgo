import { supabase } from './supabase';

const BUCKET = 'photos';

let _demoMode = false;
export function setDemoMode(v: boolean) { _demoMode = v; }

/** Upload a File directly to Supabase Storage. Falls back to base64 in demo/unauthenticated mode. */
export async function uploadPhoto(file: File): Promise<string> {
  if (_demoMode) return fileToDataUrl(file);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fileToDataUrl(file);

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });
  if (error) {
    console.warn('[storage] upload failed, falling back to base64:', error.message);
    return fileToDataUrl(file);
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Upload a data URL (e.g. cropped canvas output) to Supabase Storage.
 *  If already a storage URL or empty, returns it unchanged. */
export async function uploadDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  if (_demoMode) return dataUrl;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return dataUrl;

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type === 'image/png' ? 'png' : 'jpg';
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });
  if (error) {
    console.warn('[storage] upload failed, falling back to data URL:', error.message);
    return dataUrl;
  }

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Delete multiple photos from Supabase Storage. Filters out base64/empty entries first. */
export function deleteStoragePhotos(urls: (string | undefined)[]): void {
  urls.forEach(u => { if (u) deleteStoragePhoto(u); });
}

/** Delete a photo from Supabase Storage by its public URL. No-op for base64 or non-storage URLs. */
export async function deleteStoragePhoto(url: string): Promise<void> {
  if (!url || url.startsWith('data:') || _demoMode) return;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length).split('?')[0];
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('[storage] delete failed:', error.message);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
