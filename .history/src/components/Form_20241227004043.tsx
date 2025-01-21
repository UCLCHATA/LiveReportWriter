<div className="combined-section">
  <div>
    <h3 className="section-header">
      <i className="material-icons">check_circle</i>
      Status
    </h3>
    <div className="status-group">
      <div className="form-group">
        <label>ASC Status</label>
        <select>
          <option value="">--</option>
          {/* options */}
        </select>
      </div>
      <div className="form-group">
        <label>ADHD Status</label>
        <select>
          <option value="">--</option>
          {/* options */}
        </select>
      </div>
    </div>
  </div>
  
  <div>
    <h3 className="section-header">
      <i className="material-icons">share</i>
      Professional Referrals
    </h3>
    <div className="referrals-grid">
      <div className="referral-checkbox">
        <input type="checkbox" id="speech" />
        <label htmlFor="speech">Speech & Language</label>
      </div>
      <div className="referral-checkbox">
        <input type="checkbox" id="educational" />
        <label htmlFor="educational">Educational Psychology</label>
      </div>
      <div className="referral-checkbox">
        <input type="checkbox" id="sleep" />
        <label htmlFor="sleep">Sleep Support</label>
      </div>
      <div className="referral-other-row">
        <input type="checkbox" id="other" />
        <label htmlFor="other">Other</label>
        <input type="text" className="referral-other-input" placeholder="Specific Remarks" />
      </div>
    </div>
  </div>
</div> 