/* ===================================
Personal Info Editor - Redesigned
=================================== */
import { ResumeContent } from '../../types';

interface PersonalInfoEditorProps {
  content: ResumeContent;
  updateField: (field: string, value: any) => void;
}

export default function PersonalInfoEditor({ content, updateField }: PersonalInfoEditorProps) {
  return (
    <div className="space-y-5">
      {/* Full Width Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={content.personalInfo.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Professional Title
          </label>
          <input
            type="text"
            value={content.personalInfo.jobTitle}
            onChange={(e) => updateField('jobTitle', e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
            placeholder="Software Engineer"
          />
        </div>
      </div>

      {/* Side by Side - Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={content.personalInfo.contact?.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 py-2 bg-gray-700 border border-r-0 border-gray-600 rounded-l-lg text-gray-300 text-sm font-medium">
              +880
            </span>
            <input
              type="tel"
              value={content.personalInfo.contact?.whatsapp?.replace(/^(\+880|880)/, '') || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                updateField('whatsapp', `+880${value}`);
              }}
              className="w-full px-4 py-2 border border-gray-600 rounded-r-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
              placeholder="1234567890"
            />
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Location
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              City
            </label>
            <input
              type="text"
              value={content.personalInfo.contact?.address?.city}
              onChange={(e) => updateField('address.city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
              placeholder="Sherpur"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Division/State
            </label>
            <input
              type="text"
              value={content.personalInfo.contact?.address?.division}
              onChange={(e) => updateField('address.division', e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
              placeholder="Mymensingh"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Zip Code
            </label>
            <input
              type="text"
              value={content.personalInfo.contact?.address?.zipCode}
              onChange={(e) => updateField('address.zipCode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
              placeholder="2100"
            />
          </div>
        </div>
      </div>

      {/* LinkedIn Profile */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          LinkedIn Profile
        </label>
        <input
          type="text"
          value={content.personalInfo.contact?.linkedIn?.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/^linkedin\.com\/in\//, '') || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/^linkedin\.com\/in\//, '');
            updateField('linkedIn', value);
          }}
          className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-100 focus:outline-none focus:border-transparent transition-all duration-200 placeholder-gray-500"
          placeholder="your-username"
        />
      </div>
    </div>
  );
}
