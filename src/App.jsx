import { useState, useEffect } from 'react'
import { fetchSubgraphData } from './fetchGraph'
import { ExternalLink, Copy, TrendingUp, Users, Clock, DollarSign } from 'lucide-react'
import { useQuery } from '@tanstack/react-query';

export default function App() { //App component to always be on top
  const [registeredNames, setRegisteredNames] = useState([])
  const [uniqueOwners, setUniqueOwners] = useState([])
  const [interRegTime, setInterRegTime] = useState([])

  const { data, error, isLoading } = useQuery({
    queryKey: ['recentRegistrations'],
    queryFn: fetchSubgraphData,
    staleTime: 120000, // 2 minutes
    cacheTime: 1800000, // 30 minutes
    // refetchInterval: 120000, 
  });

  useEffect(() => {
    function findInterRegTime(arr) {
      let total = 0 // in seconds
      for (let i = 0; i < arr.length - 1; i++) {
        total += arr[i] - arr[i+1]
      }
      let avg = total / (arr.length -1)
      console.log(`Total: ${total}`)
      console.log(`Average: ${avg}`)
      let avgMins = avg / 60 // in minutes
      console.log(`Average in mins: ${avgMins}`)

      return avgMins
    }


    if (data) {
      const nameRegistereds = data;
      const names = nameRegistereds.map((item) => ({
        ...item,
        name: item.name + ".eth" //Add '.eth' to domain name
      }));
      const owners = names.map(name => name.owner);
      const timestamps = names.map(name => name.blockTimestamp)
      
      setRegisteredNames(names);
      setUniqueOwners([...new Set(owners)]);
      setInterRegTime(findInterRegTime(timestamps).toFixed(1))
    }
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-2xl text-emerald-600 dark:text-emerald-400 animate-pulse">Loading ENS data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-100 dark:bg-red-900 border-2 border-red-400 dark:border-red-600 rounded-lg p-6 max-w-md">
          <p className="text-xl text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    )
  }

  const totalValue = registeredNames.reduce((total, item) => {
    const nameLength = item.name.replace('.eth', '').length
    if (nameLength <= 3) return total + 640 
    if (nameLength === 4) return total + 160
    return total + 5
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">ENSRegistry Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track all ENS domain registrations in real-time
          </p>
        </div>

        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">ENS Pricing Guide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">5+ characters</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$5/year</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Example: abcde.eth</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">4 characters</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$160/year</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Example: abcd.eth</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium mb-2">3 characters</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$640/year</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Example: abc.eth</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total Value in Annual Fee (24h)" 
            value={`$${totalValue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatsCard 
            title="Registrations (24h)" 
            value={registeredNames.length}
            icon={TrendingUp}
          />
          <StatsCard 
            title="Domain Buyers" 
            value={uniqueOwners.length}
            icon={Users}
          />
          <StatsCard 
            title="Avg Time Between registrations" 
            value={`${interRegTime} Mins`}
            icon={Clock}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Annual Fee</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction Hash</th>
                <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registration Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {registeredNames.map((item) => <TableRow key={item.id} item={item} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


function StatsCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
          <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`ml-2 p-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 flex items-center whitespace-nowrap ${
        copied ? 'text-green-500' : 'text-gray-600 dark:text-gray-300'
      }`}
    >
      <Copy size={12} className="mr-1" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function TableRow({ item }) {
  const ensProfileUrl = `https://app.ens.domains/${item.name}`
  const etherscanUrl = `https://etherscan.io/tx/${item.transactionHash}`
  
  const getAnnualFees = (name) => {
    const nameLength = name.replace('.eth', '').length
    if (nameLength <= 3) return 640
    if (nameLength === 4) return 160
    return 5
  }

  const annualFees = getAnnualFees(item.name)

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <a
          href={ensProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline font-medium flex items-center"
        >
          <span className="truncate max-w-[100px] sm:max-w-[150px] inline-block">{item.name}</span>
          <ExternalLink size={14} className="ml-2 flex-shrink-0" />
        </a>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4 text-gray-900 dark:text-gray-100">
        ${annualFees.toFixed(2)}
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center">
          <span className="text-sm font-mono truncate max-w-[100px] sm:max-w-[150px]">{item.owner}</span>
          <CopyButton text={item.owner} />
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center">
          <span className="text-sm font-mono truncate max-w-[100px] sm:max-w-[150px]">{item.transactionHash}</span>
          <CopyButton text={item.transactionHash} />
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 p-1.5 text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-md transition-colors duration-200 flex items-center opacity-80 hover:opacity-100"
          >
            <ExternalLink size={12} className="mr-1" />
            View
          </a>
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4 text-sm">
        {formatDate(item.blockTimestamp)}
      </td>
    </tr>
  )
}


