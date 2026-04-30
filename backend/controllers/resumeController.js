const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Submission = require('../models/Submission');
const Result = require('../models/Result');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { target_job, job_description } = req.body;
    if (!target_job) return res.status(400).json({ message: 'target_job is required' });

    const submission = await Submission.create({
      user_id: req.user.id,
      target_job,
      job_description: job_description || '',
      filename: req.file.originalname,
    });

    const form = new FormData();
    form.append('resume', fs.createReadStream(req.file.path));
    form.append('target_job', target_job);
    if (job_description) form.append('job_description', job_description);

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/analyze`,
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(req.file.path);

    const { match_score, missing_skills, matched_skills, extracted_skills, suggestions } = aiResponse.data;
    const result = await Result.create({
      sub_id: submission._id,
      match_score,
      missing_skills,
      matched_skills,
      extracted_skills,
      suggestions: suggestions || [],
    });

    res.json({ submission, result });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const submissions = await Submission.find({ user_id: req.user.id }).sort({ uploaded_at: -1 });
    const subIds = submissions.map((s) => s._id);
    const results = await Result.find({ sub_id: { $in: subIds } });

    const resultMap = Object.fromEntries(results.map((r) => [r.sub_id.toString(), r]));
    const history = submissions.map((s) => ({
      submission: s,
      result: resultMap[s._id.toString()] || null,
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
};
