// components/ReactHookFormComponent.jsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';

export default function ReactHookFormComponent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      let imageUrl = '';

      // Upload image if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Image upload failed');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.path;
      }

      // Submit school data
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          contact_number: data.contact,
          email: data.email,
          image: imageUrl
        }),
      });

      if (response.ok) {
        setMessage('School added successfully!');
        setTimeout(() => {
          router.push('/showSchools');
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add school');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match('image.*')) {
        setMessage('Error: Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Error: Image must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setMessage('');
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">School Name*</label>
            <input
              id="name"
              {...register('name', { required: 'School name is required' })}
              className={errors.name ? 'error' : ''}
              placeholder="Enter school name"
            />
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className={errors.email ? 'error' : ''}
              placeholder="school@example.com"
            />
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address*</label>
          <textarea
            id="address"
            {...register('address', { required: 'Address is required' })}
            className={errors.address ? 'error' : ''}
            rows={3}
            placeholder="Full school address"
          />
          {errors.address && <span className="error-text">{errors.address.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City*</label>
            <input
              id="city"
              {...register('city', { required: 'City is required' })}
              className={errors.city ? 'error' : ''}
              placeholder="Enter city"
            />
            {errors.city && <span className="error-text">{errors.city.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="state">State*</label>
            <input
              id="state"
              {...register('state', { required: 'State is required' })}
              className={errors.state ? 'error' : ''}
              placeholder="Enter state"
            />
            {errors.state && <span className="error-text">{errors.state.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contact">Contact Number*</label>
          <input
            id="contact"
            type="tel"
            {...register('contact', {
              required: 'Contact number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Contact number must be 10 digits'
              }
            })}
            className={errors.contact ? 'error' : ''}
            placeholder="10-digit number"
          />
          {errors.contact && <span className="error-text">{errors.contact.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">School Image</label>
          <div className="image-upload-container">
            <div className="image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="School preview" />
              ) : (
                <div className="image-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>Image preview</span>
                </div>
              )}
            </div>
            <label htmlFor="image" className="file-upload-label">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <span className="file-upload-button">Choose Image</span>
            </label>
            <small>Max file size: 5MB (JPEG, PNG, GIF)</small>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Adding School...
              </>
            ) : (
              'Add School'
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .form {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #2d3748;
          font-size: 14px;
        }
        
        input, textarea {
          padding: 14px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: #fafafa;
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
          background: white;
        }
        
        input.error, textarea.error {
          border-color: #fc8181;
          box-shadow: 0 0 0 3px rgba(252, 129, 129, 0.2);
        }
        
        .error-text {
          color: #e53e3e;
          font-size: 14px;
          margin-top: 6px;
        }
        
        .image-upload-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .image-preview {
          width: 100%;
          height: 200px;
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #fafafa;
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #a0aec0;
        }
        
        .image-placeholder svg {
          margin-bottom: 8px;
        }
        
        .file-upload-label {
          display: inline-flex;
          align-items: center;
        }
        
        .file-upload-label input[type="file"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .file-upload-button {
          padding: 12px 20px;
          background: #edf2f7;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          color: #4a5568;
          transition: all 0.2s ease;
        }
        
        .file-upload-button:hover {
          background: #e2e8f0;
        }
        
        small {
          color: #718096;
          font-size: 13px;
        }
        
        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 16px;
          padding-top: 24px;
          border-top: 1px solid #eaedf0;
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 14px 28px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px rgba(37, 117, 252, 0.2);
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(37, 117, 252, 0.25);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        .cancel-btn {
          background: white;
          color: #4a5568;
          padding: 14px 28px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .cancel-btn:hover {
          background: #f7fafc;
          border-color: #cbd5e0;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .message {
          padding: 16px;
          margin: 0 30px;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
        }
        
        .success {
          background-color: #f0fff4;
          color: #2f855a;
          border: 1px solid #c6f6d5;
        }
        
        .error {
          background-color: #fff5f5;
          color: #c53030;
          border: 1px solid #fed7d7;
        }
      `}</style>
    </>
  );
}