'use client';

import React, { createRef } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import DatePicker from 'react-datepicker';
import Button from '@/components/Button';
import Config from '@/lib/config';
import uploadImage from '@/app/actions/image/uploadImage';

import 'react-datepicker/dist/react-datepicker.css';

export default class AdminAddEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: this.props.event,
      startTimeStr: this.props.event?.startDate ? this.props.event.startDate.format('HH:mm') : '',
      endTimeStr: this.props.event?.endDate ? this.props.event.endDate.format('HH:mm') : '',
      coverImageFile: null,
      coverMode: 'url', // 'url' | 'upload'
      isPreviewFlipped: false,
    };
    this.coverUploadRef = createRef();
    this.resizeTextArea = this.resizeTextArea.bind(this);
    this.handleChangeCover = this.handleChangeCover.bind(this);
    this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
    this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
    this.handleChangeTime = this.handleChangeTime.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePreviewFlip = this.handlePreviewFlip.bind(this);
  }

  resizeTextArea(e) {
    e.target.style.height = '5px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  handleChangeStartDate(date) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event.startDate = date ? moment(date) : null;
      return newState;
    });
  }

  handleChangeEndDate(date) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event.endDate = date ? moment(date) : null;
      return newState;
    });
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event[name] = value;
      return newState;
    });
  }

  handleSubmit() {
    if (!this.state.event.title || !this.state.event.startDate || !this.state.event.endDate) return;

    const callback = () => { if (this.props.onClickAdd) this.props.onClickAdd(this.state.event); };

    if (this.state.coverImageFile) {
      const formData = new FormData();
      formData.append('image', this.state.coverImageFile);

      uploadImage(formData).then((result) => {
        if (result.success && result.uuid) {
          this.setState((prev) => {
            const newState = Object.assign({}, prev);
            newState.event.cover = `${Config.API_URL + Config.routes.image.specific}/${result.uuid}`;
            return newState;
          }, callback);
        } else {
          callback();
        }
      });
    } else {
      callback();
    }
  }

  handleChangeTime(e) {
    const isStart = e.target.name === 'startTime';
    const strKey = isStart ? 'startTimeStr' : 'endTimeStr';
    const dateKey = isStart ? 'startDate' : 'endDate';
    const raw = e.target.value; // "HH:MM" from native time input, or ""

    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState[strKey] = raw;
      if (raw) {
        const [hh, mm] = raw.split(':').map(n => parseInt(n, 10));
        if (newState.event[dateKey]) {
          newState.event[dateKey] = newState.event[dateKey].clone().set({ hour: hh, minute: mm });
        } else {
          newState.event[dateKey] = moment({ hour: hh, minute: mm });
        }
      }
      return newState;
    });
  }

  handlePreviewFlip() {
    this.setState(prev => ({ isPreviewFlipped: !prev.isPreviewFlipped }));
  }

  handleChangeCover(e) {
    e.persist();
    const file = e.target.files?.[0];

    if (!file) {
      this.setState((prev) => {
        const newState = Object.assign({}, prev);
        newState.event.cover = e.target.value;
        newState.coverImageFile = null;
        return newState;
      });
    } else {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3 MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState((prev) => {
          const newState = Object.assign({}, prev);
          newState.event.cover = reader.result;
          newState.coverImageFile = file;
          return newState;
        });
      };
      reader.readAsDataURL(file);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState((prev) => {
      const newState = Object.assign({}, prev);
      newState.event = nextProps.event;
      if (newState.event) newState.event.attendanceCode = nextProps.event.attendanceCode || '';
      newState.startTimeStr = nextProps.event?.startDate ? nextProps.event.startDate.format('HH:mm') : '';
      newState.endTimeStr = nextProps.event?.endDate ? nextProps.event.endDate.format('HH:mm') : '';
      return newState;
    });
  }

  renderPreviewCard() {
    const { event, isPreviewFlipped } = this.state;
    const committeeColorMap = Object.fromEntries(Config.committeeColors);

    const title = event.title || 'Event Title';
    const committee = event.committee || 'ACM';
    const location = event.location || 'Location TBD';
    const points = event.attendancePoints || '0';

    let dateStr = 'Date TBD';
    if (event.startDate && event.endDate) {
      dateStr = `${event.startDate.format('MMM D, YYYY')}, ${event.startDate.format('h:mm a')} – ${event.endDate.format('h:mm a')}`;
    } else if (event.startDate) {
      dateStr = event.startDate.format('MMM D, YYYY, h:mm a');
    }

    const committeeColor = committeeColorMap[committee] || '#1E6CFF';

    return (
      <div className={`preview-card-container${isPreviewFlipped ? ' is-flipped' : ''}`}>
        <div className="preview-card-flipper">
          {/* Front */}
          <div className="preview-card preview-card-front" onClick={this.handlePreviewFlip} style={{ cursor: 'pointer' }} title="Click to see description">
            <div className="preview-image-container">
              <div
                className="preview-cover"
                style={{ backgroundImage: `url(${event.cover || '/logo.png'})` }}
              />
              <div className="preview-points-pill">{points} PTS</div>
            </div>
            <div className="preview-text-container">
              <p className="preview-title">{title}</p>
              <p className="preview-meta">🗓️ {dateStr}</p>
              <p className="preview-meta">📍 {location}</p>
              <p className="preview-meta" style={{ color: committeeColor }}>{committee}</p>
              <div className="preview-rsvp-pill">RSVP</div>
            </div>
          </div>

          {/* Back */}
          <div className="preview-card preview-card-back">
            <div className="preview-back-content">
              <button className="preview-flip-back-btn" onClick={this.handlePreviewFlip}>
                ← Back
              </button>
              <h3>{title}</h3>
              <div className="preview-description-scroll">
                <p>{event.description || 'Event description will appear here...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const committeeColorMap = Object.fromEntries(Config.committeeColors);
    const { coverMode } = this.state;

    return (
      <div className={`add-event-overlay${this.props.showing ? ' showing' : ''}`} onClick={this.props.onClickCancel}>
        <div className="event-modal" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">{this.props.isEdit ? 'Edit Event' : 'Create Event'}</h2>
            <button className="modal-close-btn" onClick={this.props.onClickCancel} aria-label="Close">✕</button>
          </div>

          {/* Two-column content */}
          <div className="modal-content">

            {/* Left: form */}
            <div className="modal-form">

              {/* Cover */}
              <div className="form-section">
                <p className="section-label">Cover Image <span className="optional-mark">optional</span></p>
                <div className="cover-mode-toggle">
                  <button
                    type="button"
                    className={`mode-btn${coverMode === 'url' ? ' active' : ''}`}
                    onClick={() => this.setState({ coverMode: 'url' })}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    className={`mode-btn${coverMode === 'upload' ? ' active' : ''}`}
                    onClick={() => this.setState({ coverMode: 'upload' })}
                  >
                    Upload
                  </button>
                </div>
                {coverMode === 'url' ? (
                  <input
                    type="text"
                    value={this.state.event.cover && !this.state.coverImageFile ? this.state.event.cover : ''}
                    name="cover"
                    placeholder="https://..."
                    onChange={this.handleChangeCover}
                  />
                ) : (
                  <div className="upload-zone" onClick={() => this.coverUploadRef.current?.click()}>
                    <input
                      type="file"
                      value={''}
                      name="cover"
                      ref={this.coverUploadRef}
                      id="coverInput"
                      accept="image/*"
                      onChange={this.handleChangeCover}
                      onClick={(e) => { e.target.value = null; }}
                    />
                    {this.state.coverImageFile ? (
                      <span className="upload-zone-label chosen">✓ {this.state.coverImageFile.name}</span>
                    ) : (
                      <span className="upload-zone-label">Click to choose an image</span>
                    )}
                  </div>
                )}
              </div>

              {/* Basic info */}
              <div className="form-section">
                <p className="section-label">Basic Info</p>
                <div className="field-group">
                  <label>Title <span className="required-mark">*</span></label>
                  <input type="text" value={this.state.event.title} name="title" onChange={this.handleChange} placeholder="My Awesome Event" />
                </div>
                <div className="field-row">
                  <div className="field-group">
                    <label>Committee <span className="required-mark">*</span></label>
                    <select
                      value={this.state.event.committee}
                      name="committee"
                      onChange={this.handleChange}
                      style={{ color: committeeColorMap[this.state.event.committee] }}
                    >
                      <option value="ACM" style={{ color: committeeColorMap['ACM'] }}>ACM</option>
                      {Config.committees.map((committee, index) => (
                        <option key={index} value={committee} style={{ color: committeeColorMap[committee] }}>{committee}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>External RSVP Link <span className="optional-mark">optional — overrides built-in RSVP</span></label>
                    <input type="text" value={this.state.event.eventLink} name="eventLink" onChange={this.handleChange} placeholder="https://forms.google.com/..." />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="form-section">
                <p className="section-label">Schedule</p>
                <div className="field-row">
                  <div className="field-group field-grow-3">
                    <label>Start Date <span className="required-mark">*</span></label>
                    <DatePicker
                      selected={this.state.event.startDate ? this.state.event.startDate.toDate() : null}
                      onChange={this.handleChangeStartDate}
                      className="date-picker"
                    />
                  </div>
                  <div className="field-group field-grow-2">
                    <label>Start Time <span className="required-mark">*</span></label>
                    <input
                      type="time"
                      onChange={this.handleChangeTime}
                      name="startTime"
                      value={this.state.startTimeStr}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-group field-grow-3">
                    <label>End Date <span className="required-mark">*</span></label>
                    <DatePicker
                      selected={this.state.event.endDate ? this.state.event.endDate.toDate() : null}
                      onChange={this.handleChangeEndDate}
                      className="date-picker"
                    />
                  </div>
                  <div className="field-group field-grow-2">
                    <label>End Time <span className="required-mark">*</span></label>
                    <input
                      type="time"
                      onChange={this.handleChangeTime}
                      name="endTime"
                      value={this.state.endTimeStr}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label>Location <span className="required-mark">*</span></label>
                  <input type="text" value={this.state.event.location} name="location" onChange={this.handleChange} placeholder="EBU3B B250" />
                </div>
              </div>

              {/* Attendance */}
              <div className="form-section">
                <p className="section-label">Attendance</p>
                <div className="field-row">
                  <div className="field-group">
                    <label>Check-in Code <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      value={this.state.event.attendanceCode}
                      name="attendanceCode"
                      onChange={this.handleChange}
                      placeholder="e.g. HACK2025"
                    />
                  </div>
                  <div className="field-group">
                    <label>Points <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      value={this.state.event.attendancePoints}
                      name="attendancePoints"
                      onChange={this.handleChange}
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-section">
                <p className="section-label">Description <span className="optional-mark">optional</span></p>
                <div className="field-group">
                  <textarea
                    value={this.state.event.description}
                    name="description"
                    onChange={this.handleChange}
                    onKeyUp={this.resizeTextArea}
                    placeholder="Tell people what this event is about..."
                  />
                </div>
              </div>

            </div>

            {/* Right: live preview */}
            <div className="modal-preview">
              <p className="preview-label">Preview</p>
              {this.renderPreviewCard()}
              <p className="preview-hint">Updates as you type</p>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <Button onClick={this.props.onClickCancel} style="red" text="Cancel" icon="" />
            <Button onClick={this.handleSubmit} style="green" text={this.props.isEdit ? 'Update Event' : 'Create Event'} icon="" />
          </div>

        </div>
      </div>
    );
  }
}

AdminAddEvent.propTypes = {
  event: PropTypes.object,
  onClickAdd: PropTypes.func,
  onClickCancel: PropTypes.func,
  isEdit: PropTypes.bool,
  showing: PropTypes.bool,
};

AdminAddEvent.defaultProps = {
  onClickAdd: null,
  onClickCancel: null,
  isEdit: false,
  showing: false,
};
