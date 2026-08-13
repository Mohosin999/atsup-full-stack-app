/* ===================================
Personal Info Form
=================================== */
import { Input } from "../ui/FormField";
import { ResumeContent } from "../../types";

type PersonalInfo = ResumeContent["personalInfo"];

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (value: PersonalInfo) => void;
}

export default function PersonalInfoForm({
  personalInfo,
  onChange,
}: PersonalInfoFormProps) {
  const contact = personalInfo.contact || {};
  const address = contact.address || {};

  const setField = (field: keyof PersonalInfo, value: string) =>
    onChange({ ...personalInfo, [field]: value });

  const setContact = (field: keyof typeof contact, value: string) =>
    onChange({ ...personalInfo, contact: { ...contact, [field]: value } });

  const setAddress = (field: keyof typeof address, value: string) =>
    onChange({
      ...personalInfo,
      contact: {
        ...contact,
        address: { ...address, [field]: value },
      },
    });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <Input
          label="Full Name"
          value={personalInfo.fullName || ""}
          onChange={(e) => setField("fullName", e.target.value)}
          placeholder="John Doe"
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          label="Job Title"
          value={personalInfo.jobTitle || ""}
          onChange={(e) => setField("jobTitle", e.target.value)}
          placeholder="Senior Software Engineer"
        />
      </div>
      <div>
        <Input
          label="Email"
          type="email"
          value={contact.email || ""}
          onChange={(e) => setContact("email", e.target.value)}
          placeholder="john@email.com"
        />
      </div>
      <div>
        <Input
          label="Phone"
          type="tel"
          value={contact.phone || ""}
          onChange={(e) => setContact("phone", e.target.value)}
          placeholder="+8801XXXXXXXXX"
        />
      </div>
      <div>
        <Input
          label="City"
          value={address.city || ""}
          onChange={(e) => setAddress("city", e.target.value)}
          placeholder="Dhaka"
        />
      </div>
      <div>
        <Input
          label="State / Division"
          value={address.state || ""}
          onChange={(e) => setAddress("state", e.target.value)}
          placeholder="Dhaka"
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          label="LinkedIn Profile"
          value={contact.linkedIn || ""}
          onChange={(e) => setContact("linkedIn", e.target.value)}
          placeholder="https://www.linkedin.com/in/johndoe"
        />
      </div>
    </div>
  );
}
