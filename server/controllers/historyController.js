const storage = require('../services/storage');

exports.getHistory = async (req, res) => {
  try {
    let scans = storage.getScans() || [];

    if (req.user && req.user.role !== 'Admin') {
      scans = scans.filter(s => s.userId === req.user.id || s.userId === 'anonymous');
    }

    const { search, attackClass, risk } = req.query;

    if (search) {
      const q = search.toLowerCase();
      scans = scans.filter(s =>
        (s.filename && s.filename.toLowerCase().includes(q)) ||
        (s.mainAttackCategory && s.mainAttackCategory.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q))
      );
    }

    if (attackClass && attackClass !== 'All') {
      scans = scans.filter(s =>
        s.mainAttackCategory && s.mainAttackCategory.toLowerCase().includes(attackClass.toLowerCase())
      );
    }

    if (risk && risk !== 'All') {
      scans = scans.filter(s =>
        (s.overallRisk && s.overallRisk.toLowerCase().includes(risk.toLowerCase())) ||
        (s.riskLevel && s.riskLevel.toLowerCase().includes(risk.toLowerCase()))
      );
    }

    res.json({
      success: true,
      count: scans.length,
      history: scans
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving scan history: ' + err.message });
  }
};

exports.deleteScan = async (req, res) => {
  try {
    const { id } = req.params;
    storage.deleteScan(id);
    res.json({ success: true, message: `Scan record ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting scan record: ' + err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    let scans = storage.getScans() || [];
    if (req.user && req.user.role !== 'Admin') {
      scans = scans.filter(s => s.userId === req.user.id || s.userId === 'anonymous');
    }

    let csv = 'ID,Filename,TotalRecords,NormalRecords,MaliciousRecords,MainAttackCategory,OverallRisk,AverageConfidence,Timestamp\n';
    scans.forEach(s => {
      const fn = (s.filename || s.target || '').replace(/"/g, '""');
      csv += `"${s.id}","${fn}",${s.totalRecords || 0},${s.normalRecords || 0},${s.maliciousRecords || 0},"${s.mainAttackCategory || s.attackType || 'Normal'}","${s.overallRisk || s.riskLevel || 'Low'}",${s.averageConfidence || s.confidence || 0},"${s.timestamp}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=neuroshield_ids_detection_history.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error exporting CSV: ' + err.message });
  }
};