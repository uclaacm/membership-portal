'use client';

import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  PageHeader, ApiLegend, SearchField, Select,
} from '../components/primitives';
import {
  formatBytes, formatCount, imageFilename, imageUrl,
} from '../format';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All files' },
  { value: 'unused', label: 'Unused only' },
  { value: 'large', label: 'Larger than 1 MB' },
];

const ONE_MB = 1024 * 1024;

export default function Media({
  images, canUpload, maxBytes, onUpload, onDelete,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [copied, setCopied] = useState(null);
  const fileInput = useRef(null);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    // Reset immediately so picking the same file twice in a row still fires a change event.
    event.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    setUploadError('');
    setUploaded(null);

    const uploads = [];
    const failures = [];
    // Sequential rather than parallel: these are multi-megabyte bodies, and a burst of them
    // through the Next server proxy is the kind of thing that gets a request dropped.
    for (let i = 0; i < files.length; i += 1) {
      const result = await onUpload(files[i]);
      if (result.success) uploads.push({ name: files[i].name, url: result.url });
      else failures.push(result.error || `${files[i].name} failed to upload.`);
    }

    setUploading(false);
    if (uploads.length > 0) setUploaded(uploads);
    if (failures.length > 0) setUploadError(failures.join(' '));
  };

  const visible = images.filter((image) => {
    const name = imageFilename(image);
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'unused') return !image.referenceCount;
    if (filter === 'large') return (image.size || 0) > ONE_MB;
    return true;
  });

  const storedBytes = images.reduce((sum, image) => sum + (image.size || 0), 0);

  return (
    <>
      <PageHeader
        title="Media"
        subtitle={canUpload
          ? `Uploaded images, their size, and what still references them. Max ${Math.round(maxBytes / (1024 * 1024))} MB per image.`
          : 'Uploaded images, their size, and what still references them.'}
      />

      <div className="cp-toolbar">
        <SearchField value={search} onChange={setSearch} placeholder="Search filenames" />
        <Select label="Filter files" value={filter} onChange={setFilter} options={FILTER_OPTIONS} />
        <div className="cp-toolbar-right">
          <span className="cp-toolbar-meta">
            {formatCount(images.length)} files · {formatBytes(storedBytes)} stored
          </span>
          {canUpload && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFiles}
              />
              <button
                type="button"
                className="cp-btn primary"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </>
          )}
        </div>
      </div>

      {uploadError && <div className="cp-upload-error">{uploadError}</div>}

      {uploaded && (
        <div className="cp-upload-result">
          <strong>Uploaded {uploaded.length} image{uploaded.length === 1 ? '' : 's'}.</strong>
          {uploaded.map((item) => (
            <div className="cp-upload-row" key={item.url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.name} />
              <div className="cp-upload-meta">
                <span className="cp-upload-name">{item.name}</span>
                {/* This is the URL to paste into an event's cover field. */}
                <code>{item.url}</code>
              </div>
              <button
                type="button"
                className="cp-btn secondary small"
                onClick={() => navigator.clipboard?.writeText(item.url)}
              >
                Copy URL
              </button>
            </div>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="cp-empty">No images match these filters.</div>
      ) : (
        <div className="cp-media-grid">
          {visible.map((image) => {
            const references = image.referenceCount ?? 0;
            const url = imageUrl(image.uuid);
            return (
              <div className="cp-media-tile" key={image.uuid}>
                <div
                  className="cp-media-thumb"
                  style={{ backgroundImage: `url(${url})` }}
                />
                <div className="cp-media-body">
                  <span className="cp-media-name" title={image.uuid}>{imageFilename(image)}</span>
                  <span className="cp-media-meta">
                    {formatBytes(image.size)}
                    {image.width && image.height ? ` · ${image.width}×${image.height}` : ''}
                  </span>
                  <div className="cp-media-footer">
                    <span className={`cp-media-usage ${references === 0 ? 'unused' : ''}`}>
                      {references === 0
                        ? 'Unused'
                        : `${references} event${references === 1 ? '' : 's'}`}
                    </span>
                    <span className="cp-media-actions">
                      {/* Available on every tile, not just after upload, so the URL is still
                          recoverable once the page has been refreshed. */}
                      <button
                        type="button"
                        className="copy"
                        title={url}
                        onClick={() => {
                          navigator.clipboard?.writeText(url);
                          setCopied(image.uuid);
                          setTimeout(() => setCopied(null), 1500);
                        }}
                      >
                        {copied === image.uuid ? 'Copied' : 'Copy URL'}
                      </button>
                      <button type="button" onClick={() => onDelete(image)}>Delete</button>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ApiLegend />
    </>
  );
}

Media.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  canUpload: PropTypes.bool.isRequired,
  maxBytes: PropTypes.number.isRequired,
  onUpload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
