const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    sub_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    match_score: { type: Number, required: true, min: 0, max: 100 },
    missing_skills: { type: [String], default: [] },
    matched_skills: { type: [String], default: [] },
    extracted_skills: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
