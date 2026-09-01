exports.getModelPerformance = async (req, res) => {
  res.json({
    success: true,
    status: 'pending',
    message: 'Model evaluation results have not been generated yet.'
  });
};
