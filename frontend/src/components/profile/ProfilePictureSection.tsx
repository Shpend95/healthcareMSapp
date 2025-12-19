import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, makeAspectCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { profileService } from '../../services/api';
import { validateFile } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

interface ProfilePictureSectionProps {
  patientId?: number;
  profile?: any;
  onSave: (message: string) => void;
  onError: (message: string) => void;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({ 
  patientId, 
  profile, 
  onSave, 
  onError 
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(profile?.profilePictureUrl || null);
  const [showCrop, setShowCrop] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validation = validateFile(file, { 
        maxSize: 5 * 1024 * 1024, 
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'] 
      });
      
      if (!validation.valid) {
        onError(validation.message || 'Invalid file');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCrop(true);
      });
      reader.readAsDataURL(file);
    }
  }, [onError]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      1, // aspect ratio (square)
      width,
      height
    );
    setCrop(centerCrop(crop, width, height));
  }, []);

  const getCroppedImg = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const crop = completedCrop;

      if (!image || !canvas || !crop) {
        reject(new Error('Missing image, canvas, or crop'));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      const pixelRatio = window.devicePixelRatio;
      canvas.width = crop.width * pixelRatio * scaleX;
      canvas.height = crop.height * pixelRatio * scaleY;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      const rotateRads = rotate * Math.PI / 180;
      const centerX = image.naturalWidth / 2;
      const centerY = image.naturalHeight / 2;

      ctx.save();
      ctx.translate(-cropX, -cropY);
      ctx.translate(centerX, centerY);
      ctx.rotate(rotateRads);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );
      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop, scale, rotate]);

  const handleSaveCrop = useCallback(async () => {
    if (!completedCrop) return;

    setUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg();
      const file = new File([croppedImageBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await profileService.uploadProfilePicture(patientId!, formData);
      setPreview(response.data.profilePictureUrl || URL.createObjectURL(croppedImageBlob));
      setShowCrop(false);
      setImgSrc('');
      announceToScreenReader('Profile picture uploaded successfully');
      onSave('Profile picture updated successfully');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to upload profile picture';
      onError(errorMsg);
    } finally {
      setUploading(false);
    }
  }, [completedCrop, getCroppedImg, patientId, onSave, onError]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      await profileService.deleteProfilePicture(patientId!);
      setPreview(null);
      announceToScreenReader('Profile picture deleted successfully');
      onSave('Profile picture deleted successfully');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete profile picture';
      onError(errorMsg);
    }
  };

  const getInitials = (): string => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <section
      data-testid="profile-picture-section"
      data-section="profile-picture"
      aria-labelledby="profile-picture-heading"
    >
      <div className="card">
        <h2 id="profile-picture-heading" data-testid="profile-picture-heading">
          Profile Picture
        </h2>
        <p className="muted" data-testid="profile-picture-description">
          Upload and crop your profile picture
        </p>

        {!showCrop ? (
          <div className="profile-picture-container" style={{ marginTop: '2rem' }}>
            <div
              className="upload-zone"
              data-testid="profile-picture-upload-zone"
              data-upload-zone="profile-picture"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Click to upload profile picture"
              style={{
                width: '200px',
                height: '200px',
                border: '2px dashed #ddd',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                margin: '0 auto',
                transition: 'border-color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0066cc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Profile Picture"
                  data-testid="profile-picture-preview"
                  data-image-type="profile-avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  className="avatar-placeholder"
                  data-testid="avatar-placeholder"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#0066cc',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    fontWeight: 'bold',
                  }}
                >
                  {getInitials()}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={onSelectFile}
              style={{ display: 'none' }}
              data-testid="profile-picture-input"
              data-upload-zone="profile-picture"
              aria-label="Select profile picture file"
            />

            <div className="picture-actions" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-photo-btn"
                data-action="upload-photo"
                aria-label="Upload photo from device"
              >
                {preview ? 'Change Photo' : 'Upload Photo'}
              </button>
              {preview && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  data-testid="delete-picture-btn"
                  data-action="delete-profile-picture"
                  aria-label="Delete profile picture"
                  style={{ marginLeft: '0.5rem' }}
                >
                  Delete Picture
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="crop-container" style={{ marginTop: '2rem' }} data-testid="crop-container">
            <div className="crop-controls" style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <label htmlFor="scale" data-testid="scale-label">
                Scale: {scale.toFixed(2)}
              </label>
              <input
                id="scale"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                data-testid="scale-slider"
                style={{ margin: '0 1rem' }}
              />
              <label htmlFor="rotate" data-testid="rotate-label">
                Rotate: {rotate}°
              </label>
              <input
                id="rotate"
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                data-testid="rotate-slider"
                style={{ margin: '0 1rem' }}
              />
            </div>

            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={100}
                minHeight={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, maxWidth: '100%' }}
                  onLoad={onImageLoad}
                  data-testid="crop-image"
                />
              </ReactCrop>
            )}

            <div style={{ display: 'none' }}>
              <canvas
                ref={previewCanvasRef}
                style={{
                  border: '1px solid black',
                  objectFit: 'contain',
                  width: '200px',
                  height: '200px',
                }}
              />
            </div>

            <div className="crop-actions" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveCrop}
                disabled={uploading || !completedCrop}
                data-testid="save-crop-btn"
                data-action="save-cropped-picture"
                aria-label="Save cropped picture"
              >
                {uploading ? 'Uploading...' : 'Save Cropped Picture'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowCrop(false);
                  setImgSrc('');
                  setCrop(undefined);
                  setCompletedCrop(undefined);
                }}
                data-testid="cancel-crop-btn"
                aria-label="Cancel cropping"
                style={{ marginLeft: '0.5rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfilePictureSection;

