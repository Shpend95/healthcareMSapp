import React, { useState, useRef } from 'react';
import { profileService } from '../../services/api';
import { validateFile } from '../../utils/validation';
import { announceToScreenReader } from '../../utils/accessibility';

function ProfilePictureSection({ patientId, profile, onSave, onError }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(profile?.profilePictureUrl || null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = (file) => {
    const validation = validateFile(file, { maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'] });
    if (!validation.valid) {
      onError(validation.message);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
          handleFileSelect(file);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      onError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const handleUpload = async () => {
    if (!preview) return;

    setUploading(true);
    try {
      const formData = new FormData();
      const blob = await fetch(preview).then(r => r.blob());
      formData.append('file', blob, 'profile-picture.jpg');
      
      await profileService.uploadProfilePicture(patientId, formData);
      announceToScreenReader('Profile picture uploaded successfully');
      onSave('Profile picture updated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to upload profile picture';
      onError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      await profileService.deleteProfilePicture(patientId);
      setPreview(null);
      announceToScreenReader('Profile picture deleted successfully');
      onSave('Profile picture deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete profile picture';
      onError(errorMsg);
    }
  };

  const getInitials = () => {
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
          Upload or capture your profile picture
        </p>

        <div className="profile-picture-container" style={{ marginTop: '2rem' }}>
          <div
            className="upload-zone"
            data-testid="profile-picture-upload-zone"
            data-upload-zone="profile-picture"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
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
            }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Click to upload profile picture"
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
            onChange={handleFileChange}
            style={{ display: 'none' }}
            data-testid="profile-picture-input"
            data-upload-zone="profile-picture"
            aria-label="Select profile picture file"
          />

          <div className="camera-controls" style={{ marginTop: '1rem', textAlign: 'center' }}>
            {!showCamera ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-photo-btn"
                  data-action="upload-photo"
                  aria-label="Upload photo from device"
                >
                  Upload Photo
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={startCamera}
                  data-testid="capture-photo-btn"
                  data-action="capture-photo"
                  aria-label="Capture photo from camera"
                >
                  Capture Photo
                </button>
              </>
            ) : (
              <div className="camera-view" data-testid="camera-view">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                  data-testid="camera-video"
                />
                <div className="camera-actions" style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={capturePhoto}
                    data-testid="take-photo-btn"
                    data-action="take-photo"
                    aria-label="Take photo"
                  >
                    Take Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={stopCamera}
                    data-testid="cancel-camera-btn"
                    aria-label="Cancel camera"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {preview && (
            <div className="picture-actions" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading}
                data-testid="save-picture-btn"
                data-action="save-profile-picture"
                aria-label="Save profile picture"
              >
                {uploading ? 'Uploading...' : 'Save Picture'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                data-testid="delete-picture-btn"
                data-action="delete-profile-picture"
                aria-label="Delete profile picture"
              >
                Delete Picture
              </button>
            </div>
          )}
        </div>

        <div className="image-editor" style={{ marginTop: '2rem', display: preview ? 'block' : 'none' }} data-testid="image-editor">
          <h3 data-testid="editor-title">Edit Image</h3>
          <div className="editor-controls">
            <button
              type="button"
              className="btn btn-secondary btn-compact"
              data-testid="rotate-btn"
              data-tool="rotate"
              aria-label="Rotate image"
            >
              Rotate
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-compact"
              data-testid="crop-btn"
              data-tool="crop"
              aria-label="Crop image"
            >
              Crop
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePictureSection;

