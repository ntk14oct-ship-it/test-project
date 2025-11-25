import React from 'react';
import { PeaLocationResult } from '../types';

interface AnalysisResultProps {
  result: PeaLocationResult;
  mapLinks?: string[];
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, mapLinks }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-purple-100 overflow-hidden mt-4">
      <div className="bg-purple-700 text-white px-4 py-2 flex justify-between items-center">
        <span className="font-semibold text-lg">ผลการวิเคราะห์พื้นที่ (PEA Analysis)</span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          result.confidence === 'High' ? 'bg-green-500 text-white' :
          result.confidence === 'Medium' ? 'bg-yellow-500 text-black' :
          'bg-red-500 text-white'
        }`}>
          ความแม่นยำ: {result.confidence === 'High' ? 'สูง' : result.confidence === 'Medium' ? 'ปานกลาง' : 'ต่ำ'}
        </span>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Key Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-3 rounded-md border-l-4 border-purple-600">
            <p className="text-purple-800 text-sm font-bold">สังกัดการไฟฟ้า (PEA Office)</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{result.officeName}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-500">
            <p className="text-yellow-800 text-sm font-bold">จังหวัด (Province)</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{result.province}</p>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="space-y-2 text-gray-700">
          {result.district && (
            <div className="flex items-start">
              <span className="font-semibold w-24 shrink-0">อำเภอ:</span>
              <span>{result.district}</span>
            </div>
          )}
          <div className="flex items-start">
            <span className="font-semibold w-24 shrink-0">เหตุผล:</span>
            <span className="text-gray-600 italic">{result.reasoning}</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-24 shrink-0">คำแนะนำ:</span>
            <span className="text-purple-700 font-medium">{result.suggestedAction}</span>
          </div>
        </div>

        {/* Map Links */}
        {mapLinks && mapLinks.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-bold text-gray-500 mb-2">อ้างอิงแผนที่ (Google Maps Grounding):</p>
            <div className="flex flex-wrap gap-2">
              {mapLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  เปิดแผนที่ #{idx + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;