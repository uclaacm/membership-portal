'use client';

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/Button';

export default class SyncSheetsModal extends React.Component {
  constructor() {
    super();
    this.state = {
      sheetUrl: '',
      syncStatus: 'idle',
      syncMessage: '',
    };
  }

  handleUrlChange = e => {
    this.setState({ sheetUrl: e.target.value, syncStatus: 'idle', syncMessage: '' });
  };

  handleSync = async () => {
    this.setState({ syncStatus: 'syncing', syncMessage: '' });
    const result = await this.props.onSync(this.state.sheetUrl);
    this.setState({
      syncStatus: result.success ? 'success' : 'error',
      syncMessage: result.success ? (result.message || 'Sync complete.') : (result.error || 'Sync failed.'),
    });
  };

  handleClose = () => {
    this.setState({ sheetUrl: '', syncStatus: 'idle', syncMessage: '' });
    this.props.onClose();
  };

  render() {
    const { opened, serviceAccountEmail } = this.props;
    const { sheetUrl, syncStatus, syncMessage } = this.state;

    if (!opened) return null;

    return (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>Sync Events from Sheets</h1>

            <p>
              Paste the URL or ID of a Google Sheets spreadsheet below. The sheet must meet the following requirements:
            </p>
            <ul>
              <li>
                Shared with <strong>{serviceAccountEmail || 'the portal service account'}</strong> (Viewer access or higher)
              </li>
              <li>Tabs named <strong>Week 1</strong> through <strong>Week 10</strong></li>
              <li>
                Columns in order: Committee, Title, Date, Start Time, End Time, Location, Description, Event Link, Cover Image
              </li>
            </ul>

            <div className="form-elem">
              <input
                type="text"
                className="sheets-url-input"
                placeholder="Paste spreadsheet URL or ID"
                value={sheetUrl}
                onChange={this.handleUrlChange}
              />
            </div>

            {syncMessage && (
              <p style={{ color: syncStatus === 'success' ? 'green' : '#f74e4e', marginTop: '10px' }}>
                {syncMessage}
              </p>
            )}

            <div className="form-elem" style={{ marginTop: '16px' }}>
              <Button
                color="blue"
                text="Sync"
                onClick={this.handleSync}
                loading={syncStatus === 'syncing'}
              />
            </div>

            <div className="button-container" style={{ marginTop: '24px' }}>
              <Button text="Close" color="red" onClick={this.handleClose} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SyncSheetsModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSync: PropTypes.func.isRequired,
  serviceAccountEmail: PropTypes.string,
};
