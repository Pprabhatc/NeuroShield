const storage = require('../services/storage');

exports.getAnalytics = async (req, res) => {
  try {
    let scans = storage.getScans() || [];

    // Filter scans by user if authenticated and not admin
    if (req.user && req.user.role !== 'Admin') {
      scans = scans.filter(s => s.userId === req.user.id || s.userId === 'anonymous');
    }

    const totalScans = scans.length;
    let totalFlows = 0;
    let normalFlows = 0;
    let maliciousFlows = 0;
    let highCriticalAlerts = 0;

    const attackDistribution = {};
    const riskDistribution = { 'Safe': 0, 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 };
    const dateTrendMap = {};

    scans.forEach(s => {
      const records = s.totalRecords || 1;
      const normal = s.normalRecords !== undefined ? s.normalRecords : (s.overallRisk === 'Low' || s.overallRisk === 'Safe' ? records : 0);
      const malicious = s.maliciousRecords !== undefined ? s.maliciousRecords : records - normal;

      totalFlows += records;
      normalFlows += normal;
      maliciousFlows += malicious;

      const risk = s.overallRisk || s.riskLevel || 'Low';
      if (risk === 'High' || risk === 'Critical') {
        highCriticalAlerts += 1;
      }
      riskDistribution[risk] = (riskDistribution[risk] || 0) + 1;

      // Group attack categories from scan summary or main category
      if (s.attackDistribution && Object.keys(s.attackDistribution).length > 0) {
        Object.entries(s.attackDistribution).forEach(([cat, count]) => {
          attackDistribution[cat] = (attackDistribution[cat] || 0) + count;
        });
      } else {
        const cat = s.mainAttackCategory || s.attackType || 'Normal';
        attackDistribution[cat] = (attackDistribution[cat] || 0) + 1;
      }

      // Date trend grouping
      const scanDate = new Date(s.timestamp || Date.now()).toISOString().split('T')[0];
      if (!dateTrendMap[scanDate]) {
        dateTrendMap[scanDate] = { date: scanDate, threats: 0, safe: 0, total: 0 };
      }
      dateTrendMap[scanDate].threats += malicious;
      dateTrendMap[scanDate].safe += normal;
      dateTrendMap[scanDate].total += records;
    });

    const attackPieChart = Object.keys(attackDistribution).map(key => ({
      name: key,
      value: attackDistribution[key]
    }));

    const riskBarChart = Object.keys(riskDistribution)
      .filter(k => riskDistribution[k] > 0 || totalScans === 0)
      .map(key => ({
        risk: key,
        count: riskDistribution[key]
      }));

    const detectionTrend = Object.values(dateTrendMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      metrics: {
        totalScans,
        totalNetworkFlows: totalFlows,
        normalFlows,
        maliciousFlows,
        highCriticalAlerts
      },
      charts: {
        detectionTrend,
        attackDistribution: attackPieChart,
        riskDistribution: riskBarChart
      },
      recentScans: scans.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving analytics: ' + err.message
    });
  }
};