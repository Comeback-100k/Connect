import React, { useState } from 'react';

const manuals = [
  { id: 1, title: 'Portal Setup Guide', content: 'Instructions for running the Vite and Spring Boot servers locally...' },
  { id: 2, title: 'Code Guidelines', content: 'Ensure all React components utilize the established blue and white Tailwind theme.' },
  { id: 3, title: 'Deployment Manual', content: 'Steps to package the frontend and deploy the Java backend...' },
];

const KnowledgeBase = () => {
  const [activeManual, setActiveManual] = useState(manuals[0]);

  return (
    <div className="flex h-[600px] bg-white border rounded-lg overflow-hidden shadow-sm">
      {/* Sidebar Navigation */}
      <div className="w-1/3 bg-blue-50 border-r border-blue-200 overflow-y-auto">
        <div className="p-4 bg-blue-600 text-white font-bold">
          Manuals & Docs
        </div>
        <ul>
          {manuals.map((manual) => (
            <li key={manual.id}>
              <button
                onClick={() => setActiveManual(manual)}
                className={`w-full text-left p-4 border-b border-blue-100 transition-colors ${
                  activeManual.id === manual.id 
                    ? 'bg-blue-100 text-blue-900 font-semibold' 
                    : 'text-blue-700 hover:bg-white'
                }`}
              >
                {manual.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="w-2/3 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-6 border-b pb-2">
          {activeManual.title}
        </h2>
        <div className="text-gray-700 leading-relaxed">
          {activeManual.content}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
