import { Users, CreditCard, FileText, Repeat } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Total Customers', value: '1,240', icon: Users, change: '+12%' },
    { title: 'Active Subscriptions', value: '892', icon: Repeat, change: '+5%' },
    { title: 'MRR', value: '$45,230', icon: CreditCard, change: '+8%' },
    { title: 'Pending Invoices', value: '24', icon: FileText, change: '-2%' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12 font-sans animate-in fade-in duration-500">
      
      {/* Overview Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions (Mimicking Apify Integrations Grid) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
               <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Add New Customer</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Create a new customer profile and immediately assign them to an active billing plan.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
               <Repeat className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Create Subscription</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Enroll an existing customer into one of your recurring pricing tiers.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
               <FileText className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Generate Invoice</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Manually trigger a one-off invoice or view pending draft invoices for this month.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
