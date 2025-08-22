import Link from 'next/link';

export default function NavigationButtons() {
  const buttons = [
    {
      name: 'New Project',
      href: '/component/project',
      description: 'Create and manage new projects',
      icon: '📋'
    },
    {
      name: 'New Quotation',
      href: '/component/QuotationForm',
      description: 'Generate quotes for clients',
      icon: '💰'
    },
    {
      name: 'Project Order',
      href: '/purchase-order',
      description: 'Manage purchase orders',
      icon: '📦'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Project Management Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your workflow with our comprehensive project management tools
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {buttons.map((button, index) => (
            <Link
              key={index}
              href={button.href}
              className="group relative overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100 min-h-[280px] flex flex-col justify-between">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D5128] via-[#1a3015] to-[#2D5128] opacity-0 group-hover:opacity-95 transition-opacity duration-300 rounded-2xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#2D5128] via-[#1a3015] to-[#2D5128] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-all duration-300">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {button.icon}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-white mb-3 transition-colors duration-300">
                    {button.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 group-hover:text-gray-200 mb-6 transition-colors duration-300">
                    {button.description}
                  </p>
                </div>

                {/* Action Arrow */}
                <div className="relative z-10 flex items-center text-[#2D5128] group-hover:text-white transition-colors duration-300">
                  <span className="font-semibold mr-2">Get Started</span>
                  <svg 
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-[#2D5128]/10 to-transparent rounded-full opacity-50"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#2D5128]/5 to-transparent rounded-full"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}