import Layout from '../components/Layout';
import Card from '../components/Card';
import Chart from '../components/Chart';
import '../styles/dashboard.css';

const Dashboard = () => {
  // Line Chart Data (User Growth)
  const lineChartData = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 180 },
    { name: 'Mar', value: 240 },
    { name: 'Apr', value: 300 },
    { name: 'May', value: 420 },
    { name: 'Jun', value: 500 },
  ];

  // Bar Chart Data (Revenue)
  const barChartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 6000 },
    { name: 'Mar', value: 7000 },
    { name: 'Apr', value: 8500 },
    { name: 'May', value: 9500 },
    { name: 'Jun', value: 12000 },
  ];

  // Pie Chart Data (Orders)
  const pieChartData = [
    { name: 'Completed', value: 320 },
    { name: 'Pending', value: 60 },
    { name: 'Cancelled', value: 20 },
  ];

  return (
    <Layout>
      {/* KPI Stats */}
      <div className="grid">
        <Card title="Total Users" value="500" />
        <Card title="Total Revenue" value="$12K" />
        <Card title="Orders Completed" value="320" />
      </div>

      {/* Charts Section */}
      <div className="chart-section">
        {/* User Growth (Line Chart) */}
        <div className="chart-card">
          <h3>User Growth (Last 6 months)</h3>
          <Chart type="line" data={lineChartData} />
        </div>

        {/* Monthly Revenue (Bar Chart) */}
        <div className="chart-card">
          <h3>Monthly Revenue ($)</h3>
          <Chart type="bar" data={barChartData} />
        </div>

        {/* Orders Status (Pie Chart) */}
        <div className="chart-card">
          <h3>Order Status Overview</h3>
          <Chart type="pie" data={pieChartData} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
