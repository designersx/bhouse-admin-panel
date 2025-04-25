import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import '../styles/dashboard.css';
import { url, url2 } from '../lib/api';
import { FaProjectDiagram, FaClipboardList, FaDollarSign, FaMoneyCheckAlt, FaMoneyBillWave } from 'react-icons/fa';
import { MdOutlineLeaderboard } from 'react-icons/md';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const res = await fetch(`${url}/dashboard/total-paid`);
        const data = await res.json();
        setMonthlyData(data.breakdown);
        const months = Object.keys(data.breakdown);
        if (months.length > 0) setSelectedMonth(months[0]);
      } catch (err) {
        console.error('Error fetching monthly breakdown:', err);
      }
    };
    fetchMonthlyData();
  }, []);
    
  useEffect(() => {
    const fetchStatusStats = async () => {
      try {
        const res = await fetch(`${url}/dashboard/project-status`);
        const data = await res.json();
        setStatusData(data);
      } catch (err) {
        console.error('Error fetching project status stats:', err);
      }
    };
  
    fetchStatusStats();
  }, []);
  const getLineData = () => {
    if (!selectedMonth || !monthlyData[selectedMonth]) return {};
  
    const weeks = Object.keys(monthlyData[selectedMonth]).sort();
    return {
      labels: weeks,
      datasets: [
        {
          label: `Weekly Amount (${selectedMonth})`,
          data: weeks.map(week => monthlyData[selectedMonth][week]),
          fill: false,
          borderColor: '#004680ec',
          backgroundColor: '#0d6efd',
          tension: 0.4
        }
      ]
    };
  };
  
  const pieData = {
    labels: statusData.map(s => s.status),
    datasets: [
      {
        label: 'Projects by Status',
        data: statusData.map(s => parseInt(s.count, 10)),
        backgroundColor: [
          '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1',
          '#20c997', '#fd7e14', '#6610f2', '#6c757d', '#e83e8c', '#17a2b8'
        ],
        borderColor: '#fff',
        borderWidth: 1
      }
    ]
  };
  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: { size: 14 }
        }
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw || 0;
            return `${label}: ${value} projects`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${url}/dashboard/stats`);
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchStats();
  }, []);
  const getMonthTotal = () => {
    const weeks = monthlyData[selectedMonth] || {};
    return Object.values(weeks).reduce((sum, value) => sum + value, 0);
  };
  
  if (!stats) return <Layout><div className="dashboard-container">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard-container">
        <h1 className="dashboard-title">📊 Dashboard Overview</h1>
        <div className="card-grid">
          <div className="card stat-card">
            <FaProjectDiagram className="card-icon" />
            <h2>Total Projects</h2>
            <p>{stats.totalProjects}</p>
          </div>
          <div className="card stat-card">
            <FaClipboardList className="card-icon" />
            <h2>Pending Punch List</h2>
            <p>{stats.totalPendingPunchList}</p>
          </div>
          <div className="card stat-card">
            <FaMoneyBillWave className="card-icon" />
            <h2>Total Value Of Projects</h2>
            <p>$ {stats.totalProjectValue.toLocaleString()}</p>
          </div>
          <div className="card stat-card">
            <FaMoneyCheckAlt className="card-icon" />
            <h2>Total Paid Amount</h2>
            <p>$ {stats.totalPaidAmount.toLocaleString()}</p>
          </div>
          <div className="card stat-card">
            <FaDollarSign className="card-icon" />
            <h2>Outstanding Payment</h2>
            <p>$ {stats.totalPendingAmount.toLocaleString()}</p>
          </div>
        </div>

        <h2 className="subsection-title"><MdOutlineLeaderboard /> Top 3 Customers by Project Value</h2>
        <div className="card-grid customer-grid">
          {stats.topCustomers.map((customer, index) => (
           <div key={customer.clientId} className="card customer-card">
           <div className="customer-header">
             <img
               src={
                 customer.profilePhoto
                   ? `${url2}/${customer.profilePhoto}`
                   : `${process.env.PUBLIC_URL}/assets/Default_pfp.jpg`
               }
               alt={customer.full_name}
               className="customer-avatar"
             />
             <div>
               <h3 className="customer-name">#{index + 1} {customer.full_name}</h3>
               <p className="customer-value">Total Value: $ {customer.totalProjectValue.toLocaleString()}</p>
             </div>
           </div>
         
           {/* 👇 Project List UI */}
           {customer.projectNames?.length > 0 && (
             <div className="project-list">
               <h4>Projects</h4>
               <ul>
                 {customer.projectNames.map((projectName, i) => (
                   <li key={i}>{projectName}</li>
                 ))}
               </ul>
             </div>
           )}
         </div>
         
          ))}
        </div>
        <div className='chart-container1'>
        <div className="chart-container">
  <h2 className="subsection-title">📊 Projects by Status</h2>
  <Pie data={pieData} options={pieOptions} />
</div>
<div className="chart-container wide-chart">
  <h2 className="subsection-title">📈 Monthly Revenue Overview</h2>
  <div className="filter-row">
    <label>Select Month: </label>
    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
      {Object.keys(monthlyData).map((month, idx) => (
        <option key={idx} value={month}>{moment(month).format('MMMM YYYY')}</option>
      ))}
    </select>
  </div>

  {/* 💰 Monthly Total */}
  <div className="monthly-total">
    <strong>Total for {moment(selectedMonth).format('MMMM YYYY')}:</strong>
    <span> $ {getMonthTotal().toLocaleString()}</span>
  </div>

  <Line data={getLineData()} />
</div>

</div>

      </div>
    </Layout>
  );
};

export default Dashboard;
