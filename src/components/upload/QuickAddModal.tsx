'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, Upload, MapPin, Clock, Camera, Star, ChevronRight, CheckCircle } from 'lucide-react';

interface UploadedPhoto {
  file: File;
  url: string;
  dishName: string;
  rating: number;
  gps?: { lat: number; lng: number };
  timestamp?: Date;
  placeName?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// Parse EXIF GPS from JPEG ArrayBuffer
function parseExifGPS(buffer: ArrayBuffer): { lat: number; lng: number } | null {
  try {
    const view = new DataView(buffer);
    // Check JPEG SOI marker
    if (view.getUint16(0) !== 0xFFD8) return null;

    let offset = 2;
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset);
      offset += 2;
      if (marker === 0xFFE1) {
        // APP1 - EXIF
        const length = view.getUint16(offset);
        offset += 2;
        // Check "Exif" header
        const exifHeader = String.fromCharCode(
          view.getUint8(offset), view.getUint8(offset+1),
          view.getUint8(offset+2), view.getUint8(offset+3)
        );
        if (exifHeader !== 'Exif') return null;

        const tiffOffset = offset + 6;
        const byteOrder = view.getUint16(tiffOffset);
        const le = byteOrder === 0x4949;

        const ifdOffset = tiffOffset + view.getUint32(tiffOffset + 4, le);
        const numEntries = view.getUint16(ifdOffset, le);

        let gpsIFDOffset: number | null = null;
        for (let i = 0; i < numEntries; i++) {
          const entryOffset = ifdOffset + 2 + i * 12;
          const tag = view.getUint16(entryOffset, le);
          if (tag === 0x8825) {
            gpsIFDOffset = tiffOffset + view.getUint32(entryOffset + 8, le);
          }
        }

        if (gpsIFDOffset === null) return null;

        const gpsEntries = view.getUint16(gpsIFDOffset, le);
        let latRef = 'N', lngRef = 'E';
        let latRaw: number[] | null = null, lngRaw: number[] | null = null;

        for (let i = 0; i < gpsEntries; i++) {
          const entryOffset = gpsIFDOffset + 2 + i * 12;
          const tag = view.getUint16(entryOffset, le);
          const count = view.getUint32(entryOffset + 4, le);
          const valOffset = tiffOffset + view.getUint32(entryOffset + 8, le);

          if (tag === 0x0001) latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
          if (tag === 0x0003) lngRef = String.fromCharCode(view.getUint8(entryOffset + 8));
          if (tag === 0x0002) {
            latRaw = [
              view.getUint32(valOffset, le) / view.getUint32(valOffset+4, le),
              view.getUint32(valOffset+8, le) / view.getUint32(valOffset+12, le),
              view.getUint32(valOffset+16, le) / view.getUint32(valOffset+20, le),
            ];
          }
          if (tag === 0x0004) {
            lngRaw = [
              view.getUint32(valOffset, le) / view.getUint32(valOffset+4, le),
              view.getUint32(valOffset+8, le) / view.getUint32(valOffset+12, le),
              view.getUint32(valOffset+16, le) / view.getUint32(valOffset+20, le),
            ];
          }
        }

        if (latRaw && lngRaw) {
          let lat = latRaw[0] + latRaw[1]/60 + latRaw[2]/3600;
          let lng = lngRaw[0] + lngRaw[1]/60 + lngRaw[2]/3600;
          if (latRef === 'S') lat = -lat;
          if (lngRef === 'W') lng = -lng;
          return { lat, lng };
        }
        return null;
      } else {
        const length = view.getUint16(offset);
        offset += length;
      }
    }
    return null;
  } catch { return null; }
}

// Reverse geocode via Nominatim (no API key needed)
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'TasteAndTerrain/1.0' } }
    );
    const data = await res.json();
    return data.address?.restaurant || data.address?.cafe ||
           data.address?.amenity || data.address?.road ||
           data.display_name?.split(',')[0] || null;
  } catch { return null; }
}

export default function QuickAddModal({ open, onClose }: Props) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [step, setStep] = useState<'drop' | 'review' | 'done'>('drop');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) { setPhotos([]); setStep('drop'); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setProcessing(true);
    const parsed: UploadedPhoto[] = await Promise.all(
      acceptedFiles.slice(0, 6).map(async (file) => {
        const url = URL.createObjectURL(file);
        const buf = await file.arrayBuffer();
        const gps = parseExifGPS(buf);
        let placeName: string | undefined;
        if (gps) {
          const name = await reverseGeocode(gps.lat, gps.lng);
          if (name) placeName = name;
        }
        const timestamp = file.lastModified ? new Date(file.lastModified) : undefined;
        return { file, url, dishName: '', rating: 8, gps: gps ?? undefined, timestamp, placeName };
      })
    );
    setPhotos(parsed);
    setProcessing(false);
    setStep('review');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.webp'] },
    multiple: true,
  });

  function updatePhoto(index: number, patch: Partial<UploadedPhoto>) {
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p));
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl pointer-events-auto w-full"
              style={{ maxWidth: 680 }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
                <div>
                  <h2 className="serif text-lg font-semibold text-[#1A1A1A]">Quick Add</h2>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">
                    {step === 'drop' ? 'Drop photos — we\'ll extract location & time automatically' :
                     step === 'review' ? 'Review & name each dish' : 'Saved to your journal'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Step: Drop */}
                {step === 'drop' && (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-[#C87A53] bg-[#FDF8F5]'
                        : 'border-[#D4CFC6] hover:border-[#C87A53] hover:bg-[#FDFCFA]'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-14 h-14 rounded-full bg-[#F0ECE6] flex items-center justify-center mx-auto mb-4">
                      <Upload size={22} className="text-[#C87A53]" />
                    </div>
                    <p className="font-medium text-[#1A1A1A] mb-1">
                      {isDragActive ? 'Drop your photos here' : 'Drag & drop meal or hotel photos'}
                    </p>
                    <p className="text-sm text-[#8A8A8A]">JPG, PNG, HEIC · up to 6 photos</p>

                    <div className="flex items-center justify-center gap-6 mt-6 text-xs text-[#8A8A8A]">
                      <span className="flex items-center gap-1.5"><MapPin size={11} className="text-[#C87A53]" />Auto-detects location from GPS</span>
                      <span className="flex items-center gap-1.5"><Clock size={11} className="text-[#C87A53]" />Auto-fills date & time</span>
                      <span className="flex items-center gap-1.5"><Camera size={11} className="text-[#C87A53]" />One photo per dish</span>
                    </div>
                  </div>
                )}

                {/* Processing */}
                {processing && (
                  <div className="text-center py-10">
                    <div className="w-10 h-10 rounded-full border-2 border-[#C87A53] border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="text-sm text-[#8A8A8A]">Reading EXIF data & resolving location…</p>
                  </div>
                )}

                {/* Step: Review */}
                {step === 'review' && (
                  <div className="space-y-4">
                    {/* Inferred metadata banner */}
                    {photos[0] && (
                      <div className="bg-[#F5F3EE] rounded-xl p-3 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#C87A53]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin size={13} className="text-[#C87A53]" />
                        </div>
                        <div className="text-xs">
                          <p className="font-medium text-[#1A1A1A]">
                            {photos[0].placeName ? `Detected: ${photos[0].placeName}` : 'Location not found in EXIF'}
                          </p>
                          {photos[0].timestamp && (
                            <p className="text-[#8A8A8A] mt-0.5">
                              {photos[0].timestamp.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                          {photos[0].gps && (
                            <p className="text-[#8A8A8A] mt-0.5">GPS: {photos[0].gps.lat.toFixed(4)}, {photos[0].gps.lng.toFixed(4)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Photo cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo, i) => (
                        <motion.div
                          key={i}
                          className="bento-card overflow-hidden"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <div className="h-36 overflow-hidden bg-[#F0ECE6]">
                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 space-y-2">
                            <input
                              type="text"
                              placeholder="Dish name…"
                              value={photo.dishName}
                              onChange={e => updatePhoto(i, { dishName: e.target.value })}
                              className="w-full text-sm border-0 border-b border-[#E8E6E1] bg-transparent pb-1 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2]"
                            />
                            {/* Star picker */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider">Rating</span>
                              <div className="flex gap-0.5">
                                {[2,4,6,8,10].map(v => (
                                  <button
                                    key={v}
                                    onClick={() => updatePhoto(i, { rating: v })}
                                    className={`text-base transition-colors ${photo.rating >= v ? 'text-[#C87A53]' : 'text-[#E0DBD4]'}`}
                                  >★</button>
                                ))}
                              </div>
                              <span className="text-xs text-[#8A8A8A]">{photo.rating}/10</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Done */}
                {step === 'done' && (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle size={32} className="text-green-600" />
                    </motion.div>
                    <h3 className="serif text-xl font-semibold text-[#1A1A1A] mb-2">Added to your journal</h3>
                    <p className="text-sm text-[#8A8A8A]">{photos.length} dish{photos.length !== 1 ? 'es' : ''} saved</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {step === 'review' && (
                <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setStep('drop')}
                    className="text-sm text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
                  >← Add more photos</button>
                  <button
                    onClick={() => setStep('done')}
                    className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors"
                  >
                    Save to journal <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {step === 'done' && (
                <div className="px-6 pb-6 pt-2 text-center">
                  <button
                    onClick={onClose}
                    className="bg-[#C87A53] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#A85E3A] transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
