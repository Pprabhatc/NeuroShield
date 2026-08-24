const storage = require('../services/storage');

exports.getHistory = async (req, res) => {
  try {
    let scans = storage.getScans();
    const { search, type, risk } = req.query;

    if (search) {
      const q = search.toLowerCase();
      scans = scans.filter(s => 
        (s.target && s.target.toLowerCase().includes(q)) ||
        (s.attackType && s.attackType.toLowerCase().includes(q)) ||
        (s.summary && s.summary.toLowerCase().includes(q))
      );
    }

    if (type && type !== 'All') {
      scans = scans.filter(s => s.type.toLowerCase().includes(type.toLowerCase()));
    }

    if (risk && risk !== 'All') {
      scans = scans.filter(s => s.riskLevel.toLowerCase().includes(risk.toLowerCase()));
    }

    res.json({
      success: true,
      count: scans.length,
      history: scans
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving scan history: ' + err.message });
  }
};

exports.deleteScan = async (req, res) => {
  try {
    const { id } = req.params;
    storage.deleteScan(id);
    res.json({ success: true, message: `Scan record ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting scan record: ' + err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const scans = storage.getScans();
    let csv = 'ID,Type,Target,AttackType,Confidence,RiskLevel,Timestamp\n';
    scans.forEach(s => {
      csv += `"${s.id}","${s.type}","${s.target.replace(/"/g, '""')}","${s.attackType}",${s.confidence},"${s.riskLevel}","${s.timestamp}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=neuroshield_threat_intelligence.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error exporting CSV: ' + err.message });
  }
};
