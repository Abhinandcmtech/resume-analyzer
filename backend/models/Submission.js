const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target_job: { type: String, required: true, trim: true },
    job_description: { type: String, default: '' },
    filename: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
